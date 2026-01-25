import {AdminDocsUrls} from '@app/admin/admin-config';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
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
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {apiClient} from '@common/http/query-client';
import {Button} from '@ui/buttons/button';
import {Form} from '@ui/forms/form';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {OpenInNewIcon} from '@ui/icons/material/OpenInNew';
import {BlockerDialog} from '@ui/overlays/dialog/blocker-dialog';
import {toast} from '@ui/toast/toast';
import {ReactElement, ReactNode, use, useState} from 'react';
import {flushSync} from 'react-dom';
import {useForm, UseFormReturn} from 'react-hook-form';

type FormValue = {
  purchase_code: string;
};

type Props = {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
  rightContent?: ReactNode;
};
export function LicensePage({tabs, title, rightContent}: Props) {
  return (
    <div className="dashboard-grid-content dashboard-rounded-panel flex h-full flex-col">
      <DatatablePageHeaderBar
        title={title}
        border="border-none"
        showSidebarToggleButton
        rightContent={rightContent}
      />
      {tabs}
      <div className="overflow-y-auto">
        <div className="mx-auto p-12 @container/settings-form md:p-24 lg:max-w-[1440px]">
          <LicensePanel />
          <ModulePanels />
        </div>
      </div>
    </div>
  );
}

function LicensePanel() {
  const {trans} = useTrans();
  const {data} = useAdminSettings();
  const [activatedPurchaseCode, setActivatedPurchaseCode] = useState(
    data.license?.purchase_code ?? '',
  );

  const form = useForm<FormValue>({
    defaultValues: {
      purchase_code: activatedPurchaseCode ?? '',
    },
  });

  const [isPending, setIsPending] = useState(false);
  const handleSubmit = async (values: FormValue) => {
    setIsPending(true);
    const code = await registerPurchaseCode({
      code: values.purchase_code,
      form,
      itemId: data.license?.item_id ?? 0,
    });
    setIsPending(false);
    if (code) {
      toast(message('Purchase code activated'));
      setActivatedPurchaseCode(code);
    }
  };

  return (
    <SettingsPanel
      title={<Trans message="Envato purchase code" />}
      description={
        <Trans message="Activate your license to enable automatic updates and other functionality." />
      }
      link={
        <Button
          variant="link"
          color="primary"
          size="sm"
          href={AdminDocsUrls.settings.purchaseCode}
          target="_blank"
        >
          <Trans message="Where is my purchase code?" />
        </Button>
      }
    >
      <Form
        form={form}
        disableNativeValidation
        onSubmit={values => handleSubmit(values)}
      >
        <FormTextField
          name="purchase_code"
          label={<Trans message="Envato purchase code" />}
          labelDisplay="hidden"
          placeholder={trans(
            message('Example: :code', {
              values: {code: '91939276-b234-49d1-ac42-6c7xe5t7a128'},
            }),
          )}
          endAdornment={
            <Chip
              size="xs"
              color={activatedPurchaseCode ? 'positive' : 'danger'}
              className="mr-12"
            >
              {activatedPurchaseCode ? (
                <Trans message="ACTIVATED" />
              ) : (
                <Trans message="NOT ACTIVATED" />
              )}
            </Chip>
          }
          required
        />
        <Button
          variant="flat"
          color="primary"
          type="submit"
          disabled={isPending}
          className="mt-24"
        >
          <Trans message="Activate purchase code" />
        </Button>
      </Form>
    </SettingsPanel>
  );
}

function ModulePanels() {
  const {data} = useAdminSettings();

  if (!data.modules || !Object.keys(data.modules).length) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-12 mt-44 text-lg font-semibold">
        <Trans message="Addon purchase codes" />
      </h2>
      <div className="space-y-12">
        {Object.entries(data.modules)
          .filter(([, module]) => !module.built_in)
          .map(([key, module]) => (
            <UpdaterContextProvider key={key}>
              <ModulePanel name={key} config={module} />
            </UpdaterContextProvider>
          ))}
      </div>
    </div>
  );
}

type ModulePanelProps = {
  name: string;
  config: NonNullable<AdminSettings['modules']>[string];
};
function ModulePanel({config, name}: ModulePanelProps) {
  const {trans} = useTrans();
  const {data} = useAdminSettings();
  const envatoItemId = data.modules?.[name]?.envato_item_id;
  const {updateOrInstallModule} = use(UpdaterContext);
  const [installed, setInstalled] = useState(config.installed);
  const [activatedPurchaseCode, setActivatedPurchaseCode] = useState(
    config.envato_purchase_code,
  );
  const form = useForm<FormValue>({
    defaultValues: {
      purchase_code: activatedPurchaseCode ?? '',
    },
  });

  const handleModuleInstall = async () => {
    const success = await updateOrInstallModule(name);
    if (success) {
      flushSync(() => {
        setIsPending(false);
        setInstalled(true);
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.danger(message('Failed to install module'));
    }
  };

  const [isPending, setIsPending] = useState(false);
  const handleSubmit = async (values: FormValue) => {
    // // purchase code
    setIsPending(true);
    const code = await registerPurchaseCode({
      code: values.purchase_code,
      form,
      itemId: config.envato_item_id ?? 0,
      moduleName: name,
    });

    if (code) {
      setActivatedPurchaseCode(code);
      // no need to show this toast if we will be installing the module
      if (installed) {
        toast(message('Purchase code activated'));
      } else {
        handleModuleInstall();
      }
    }

    setIsPending(false);
  };

  return (
    <SettingsPanel
      id={`module-${name}`}
      title={config.label}
      description={
        <Trans message="Enter purchase code to install this addon." />
      }
      link={
        <Button
          variant="link"
          color="primary"
          size="sm"
          href={`https://codecanyon.net/item/i/${envatoItemId}`}
          target="_blank"
          endIcon={<OpenInNewIcon />}
        >
          <Trans message="Get this addon" />
        </Button>
      }
    >
      {isPending ? <BlockerDialog shouldBlock /> : null}
      <Form form={form} onSubmit={values => handleSubmit(values)}>
        <FormTextField
          required
          size="sm"
          name="purchase_code"
          label={<Trans message="Envato purchase code" />}
          labelDisplay="hidden"
          placeholder={trans(
            message('Example: :code', {
              values: {code: '91939276-b234-49d1-ac42-6c7xe5t7a128'},
            }),
          )}
          endAdornment={
            <Chip
              size="xs"
              color={activatedPurchaseCode ? 'positive' : 'danger'}
              className="mr-12"
            >
              {activatedPurchaseCode ? (
                <Trans message="ACTIVATED" />
              ) : (
                <Trans message="NOT ACTIVATED" />
              )}
            </Chip>
          }
        />
        <Button
          variant="flat"
          color="primary"
          type="submit"
          className="mt-16"
          size="xs"
          disabled={isPending}
        >
          {installed ? (
            <Trans message="Activate" />
          ) : (
            <Trans message="Activate and install" />
          )}
        </Button>
      </Form>
      <ModuleInstallProgress
        onRetry={() => handleModuleInstall()}
        className="mt-24 rounded-panel border p-16"
      />
    </SettingsPanel>
  );
}

type ModuleInstallProgressProps = {
  onRetry: () => void;
  className?: string;
};
export function ModuleInstallProgress({
  onRetry,
  className,
}: ModuleInstallProgressProps) {
  const {events, updateInProgress} = use(UpdaterContext);
  const lastEvent = events.at(-1);

  if (!events.length && !updateInProgress) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-18">
        {events.map((event, index) => (
          <UpdateEventMessage event={event} key={index} />
        ))}
      </div>
      {lastEvent?.context?.error ? (
        <div className="mt-24 flex items-center gap-12">
          <Button variant="flat" color="primary" onClick={() => onRetry()}>
            <Trans message="Retry" />
          </Button>
          <Button variant="outline" color="primary" endIcon={<OpenInNewIcon />}>
            <Trans message="Update manually" />
          </Button>
        </div>
      ) : null}
      {lastEvent?.step === UpdateStep.Finalizing &&
      lastEvent?.status === UpdateStepStatus.Completed ? (
        <div className="mt-24 text-muted">
          <Trans message="Module installed successfully! Reloading the page..." />
        </div>
      ) : null}
    </div>
  );
}

type RegisterPurchaseCodeParams = {
  code: string;
  form: UseFormReturn<{purchase_code: string}>;
  itemId: number;
  moduleName?: string;
};
async function registerPurchaseCode({
  code,
  form,
  itemId,
  moduleName,
}: RegisterPurchaseCodeParams): Promise<string | undefined> {
  try {
    const response = await apiClient.post<{purchase_code: string}>(
      'license/register-purchase-code',
      {
        purchase_code: code,
        item_id: itemId,
        module: moduleName,
      },
    );

    return response.data.purchase_code;
  } catch (error) {
    onFormQueryError(error, form);
  }
}
