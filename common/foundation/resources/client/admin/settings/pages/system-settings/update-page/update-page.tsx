import {AdminDocsUrls} from '@app/admin/admin-config';
import {UpdateEventMessage} from '@common/admin/settings/pages/system-settings/update-page/update-event-message';
import {
  UpdaterContext,
  UpdaterContextProvider,
} from '@common/admin/settings/pages/system-settings/update-page/updater-context-provider';
import {
  UpdateStep,
  UpdateStepStatus,
} from '@common/admin/settings/pages/system-settings/update-page/updater-types';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {DatatablePageHeaderBar} from '@common/datatable/page/datatable-page-with-header-layout';
import {Button} from '@ui/buttons/button';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {BrowserUpdatedIcon} from '@ui/icons/material/BrowserUpdated';
import {OpenInNewIcon} from '@ui/icons/material/OpenInNew';
import {BlockerDialog} from '@ui/overlays/dialog/blocker-dialog';
import {ucFirst} from '@ui/utils/string/uc-first';
import {ReactElement, ReactNode, use} from 'react';
import {Link} from 'react-router';

type Props = {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
  rightContent?: ReactNode;
};
export function UpdatePage(props: Props) {
  return (
    <UpdaterContextProvider>
      <Content {...props} />
    </UpdaterContextProvider>
  );
}

function Content({tabs, title, rightContent}: Props) {
  const {updateStarted} = use(UpdaterContext);

  const content = updateStarted ? <ActiveUpdatePanel /> : <WelcomePanel />;

  return (
    <div className="dashboard-grid-content dashboard-rounded-panel flex h-full flex-col">
      <DatatablePageHeaderBar
        title={title}
        showSidebarToggleButton
        border="border-none"
        rightContent={rightContent}
      />
      {tabs}
      <div className="overflow-y-auto">
        <div className="mx-auto p-12 @container/settings-form md:p-24 lg:max-w-[1440px]">
          {content}
        </div>
      </div>
    </div>
  );
}

type UpdatePanelProps = {
  children: ReactNode;
};
function UpdatePanel({children}: UpdatePanelProps) {
  const {data} = useAdminSettings();
  const alreadyOnLatestVersion = !data?.update_available;
  return (
    <div className="rounded-panel border p-24 shadow-sm">
      <div className="text-center">
        <BrowserUpdatedIcon size="lg" />
        <h1 className="mb-4 mt-12 text-xl font-semibold">
          {alreadyOnLatestVersion ? (
            <Trans message="You already have the latest version installed" />
          ) : (
            <Trans message="System update" />
          )}
        </h1>
        <p className="text-muted">
          <Trans message="Update your system to the latest version. This will download and install updates automatically, please do not close this page while update is in progress." />
        </p>
      </div>
      <div className="mt-24">{children}</div>
    </div>
  );
}

function WelcomePanel() {
  const {updateAppAndModules} = use(UpdaterContext);
  const {data} = useAdminSettings();
  const alreadyOnLatestVersion = !data?.update_available;
  return (
    <UpdatePanel>
      <div className="w-full text-center">
        <Button
          variant="flat"
          color="primary"
          onClick={async () => {
            const success = await updateAppAndModules();
            if (success) {
              setTimeout(() => {
                window.location.href = '/admin/settings';
              }, 1000);
            }
          }}
        >
          {alreadyOnLatestVersion ? (
            <Trans
              message="Re-install version :version"
              values={{version: data?.server?.app_version}}
            />
          ) : (
            <Trans message="Start Update" />
          )}
        </Button>
      </div>
    </UpdatePanel>
  );
}

function ActiveUpdatePanel() {
  const {
    events,
    updateInProgress,
    updateAppAndModules,
    moduleNames,
    activeModuleName,
  } = use(UpdaterContext);
  const lastEvent = events.at(-1);

  return (
    <div>
      <BlockerDialog shouldBlock={updateInProgress} />
      <UpdatePanel>
        <div className="border-t border-t-divider-lighter pt-24">
          {moduleNames?.length && activeModuleName ? (
            <div className="mb-20 font-semibold">
              <Trans message="Updating" />:{' '}
              <ModuleDisplayName name={activeModuleName} />
            </div>
          ) : null}
          <div className="space-y-18">
            {events.map((event, index) => (
              <UpdateEventMessage event={event} key={index} />
            ))}
          </div>
          {lastEvent?.context?.error ? (
            <div className="mt-24 flex items-center gap-12">
              <Button
                variant="flat"
                color="primary"
                onClick={() => updateAppAndModules()}
              >
                <Trans message="Retry" />
              </Button>
              <Button
                variant="outline"
                color="primary"
                href={AdminDocsUrls.manualUpdate}
                target="_blank"
                endIcon={<OpenInNewIcon />}
              >
                <Trans message="Update manually" />
              </Button>
            </div>
          ) : null}
          {lastEvent?.step === UpdateStep.Finalizing &&
          lastEvent?.status === UpdateStepStatus.Completed ? (
            <div className="mt-24">
              <div className="mb-12 text-muted">
                <Trans message="Update completed successfully! Reloading the page..." />
              </div>
              <Button
                variant="flat"
                color="primary"
                elementType={Link}
                to="/admin"
              >
                <Trans message="Return to admin area" />
              </Button>
            </div>
          ) : null}
        </div>
      </UpdatePanel>
    </div>
  );
}

type ModuleDisplayNameProps = {
  name: string;
};
function ModuleDisplayName({name}: ModuleDisplayNameProps) {
  const {data} = useAdminSettings();
  if (name === 'app') {
    return <Trans message="Application" />;
  }
  return <span>{data.modules?.[name]?.label ?? ucFirst(name)}</span>;
}
