import {
  UpdateEvent,
  UpdateStep,
  UpdateStepMessage,
  UpdateStepName,
  UpdateStepStatus,
} from '@common/admin/settings/pages/system-settings/update-page/updater-types';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {throwAxiosError} from '@common/http/get-axios-error-message';
import {makeStreamedFetchRequest} from '@common/http/make-streamed-fetch-request';
import {EventSourceParserStream} from 'eventsource-parser/stream';
import {createContext, ReactNode, useState} from 'react';
import {flushSync} from 'react-dom';

const DEFAULT_ERROR = 'An unknown error occurred during update';

type StartUpdateParams = {
  moduleName?: string;
};

type UpdaterContextValue = {
  updateInProgress: boolean;
  updateStarted: boolean;
  setUpdateStarted: (value: boolean) => void;
  events: UpdateEvent[];
  updateOrInstallModule: (moduleName: string) => Promise<boolean>;
  updateAppAndModules: () => Promise<boolean>;
  moduleNames: string[];
  // module that is currently being updated ("app" for main app)
  activeModuleName: string | null;
};

// execute isolatable steps in separate http requests to hopefully avoid request timeout issues
const groupedSteps: UpdateStepName[][] = [
  [UpdateStep.Preparing],
  [UpdateStep.Downloading],
  [UpdateStep.Extracting],
  [UpdateStep.MovingNewFiles],
  [UpdateStep.Finalizing],
];

let internalEvents: UpdateEvent[] = [];

const anyStepFailed = () =>
  internalEvents.some(e => e.status === UpdateStepStatus.Failed);

export const UpdaterContext = createContext<UpdaterContextValue>(null!);

type UpdaterContextProviderProps = {
  children: ReactNode;
};
export function UpdaterContextProvider({
  children,
}: UpdaterContextProviderProps) {
  // get names of modules that should be updated along with the app
  const {data: adminSettings} = useAdminSettings();
  const moduleNames = Object.entries(adminSettings?.modules ?? {})
    .filter(
      ([, module]) =>
        !module.built_in && module.installed && module.envato_purchase_code,
    )
    .map(([name]) => name);

  const [updateStarted, setUpdateStarted] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [events, setEvents] = useState<UpdateEvent[]>([]);
  const [activeModuleName, setActiveModuleName] = useState<string | null>(null);

  const updateOrInstallModule = async (
    moduleName: string,
  ): Promise<boolean> => {
    setUpdateStarted(true);
    setUpdateInProgress(true);
    setActiveModuleName(moduleName);

    const success = await runUpdate(moduleName);
    flushSync(() => setUpdateInProgress(false));
    return success;
  };

  const updateAppAndModules = async (): Promise<boolean> => {
    setUpdateStarted(true);
    setUpdateInProgress(true);

    const names = ['app', ...moduleNames];

    for (const name of names) {
      setActiveModuleName(name);
      const success = await runUpdate(name);
      if (!success) {
        flushSync(() => setUpdateInProgress(false));
        return false;
      }
    }

    flushSync(() => setUpdateInProgress(false));
    return true;
  };

  const runUpdate = async (moduleName: 'app' | string): Promise<boolean> => {
    internalEvents = [];
    setEvents([]);

    for (const steps of groupedSteps) {
      if (anyStepFailed()) {
        break;
      }
      await runUpdateStep({
        steps,
        moduleName,
        onEvent: () => setEvents(internalEvents),
      });
    }

    return !anyStepFailed();
  };

  return (
    <UpdaterContext.Provider
      value={{
        updateInProgress,
        updateStarted,
        setUpdateStarted,
        events,
        updateOrInstallModule,
        updateAppAndModules,
        moduleNames,
        activeModuleName,
      }}
    >
      {children}
    </UpdaterContext.Provider>
  );
}

type RunUpdateStepParams = {
  steps: UpdateStepName[];
  moduleName?: string;
  onEvent: () => void;
};

async function runUpdateStep({
  steps,
  moduleName,
  onEvent,
}: RunUpdateStepParams): Promise<void> {
  const abortController = new AbortController();

  // add active event on js side as well, incase buffering is disabled on the server
  // and we won't receive any events until http request for step is completed
  internalEvents.push({
    type: 'event',
    step: steps[0],
    status: UpdateStepStatus.Active,
    message: UpdateStepMessage[steps[0]],
  });
  onEvent();

  try {
    const response = await makeStreamedFetchRequest(
      'update',
      {
        steps,
        moduleName,
      },
      abortController?.signal,
    );

    if (!response.ok || !response?.body) {
      throwAxiosError();
    }

    for await (const e of responseToIterator(response, abortController)) {
      internalEvents =
        internalEvents.at(-1)?.step === e.step
          ? [...internalEvents.slice(0, -1), e]
          : [...internalEvents, e];
      onEvent();
      if (e.context?.error) {
        break;
      }
    }
  } catch (err) {
    // always set last event to failed if there's a client side error
    finalizeInternalEvents(true);
  }

  finalizeInternalEvents();
}

async function* responseToIterator(
  response: Response,
  abortController: AbortController,
): AsyncGenerator<UpdateEvent> {
  if (!response.ok || !response.body) {
    return throwAxiosError();
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();

  // Handle any cases where we must abort
  reader.closed.then(() => abortController.abort());

  // Handle logic for aborting
  abortController.signal.addEventListener('abort', () => reader.cancel());

  while (!abortController.signal.aborted) {
    const {done, value} = await reader.read();
    if (done) {
      abortController.abort();
      break;
    }

    if (!value || !value.event) continue;

    const e = JSON.parse(value.data);

    // end stream
    if (e.type === 'endStream') {
      abortController.abort();
      break;
    }

    // emit
    yield e;
  }
}

// update step didn't complete fully, but no error was returned from backend
function finalizeInternalEvents(forceError: boolean = false): UpdateEvent[] {
  if (
    !forceError &&
    internalEvents.length &&
    internalEvents.at(-1)?.status === UpdateStepStatus.Completed
  ) {
    return internalEvents;
  }

  // incase no events were emitted at all
  if (!internalEvents?.length) {
    internalEvents = [
      {
        type: 'event',
        step: UpdateStep.Preparing,
        status: UpdateStepStatus.Failed,
        message: 'Preparing to update',
      },
    ];
  }

  // change last event from active to failed
  const i = internalEvents.length - 1;
  internalEvents[i].status = UpdateStepStatus.Failed;
  if (!internalEvents[i].context) {
    internalEvents[i].context = {};
  }
  internalEvents[i].context.error =
    internalEvents[i].context.error || DEFAULT_ERROR;
  return internalEvents;
}
