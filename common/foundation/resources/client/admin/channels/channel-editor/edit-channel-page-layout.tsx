import {
  UpdateChannelPayload,
  useUpdateChannel,
} from '@common/admin/channels/requests/use-update-channel';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {useChannel} from '@common/channels/requests/use-channel';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';
import {useForm, UseFormReturn} from 'react-hook-form';

interface Props {
  children: ReactNode;
}
export function EditChannelPageLayout({children}: Props) {
  const query = useChannel(undefined, 'editChannelPage');
  const channel = query.data.channel;
  const form = useForm<UpdateChannelPayload>({
    // @ts-ignore
    defaultValues: {
      ...channel,
    },
  }) as unknown as UseFormReturn<UpdateChannelPayload>;
  const updateChannel = useUpdateChannel(form);

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        updateChannel.mutate(values);
      }}
      title={
        <Breadcrumb>
          <BreadcrumbItem to="/admin/channels">
            <Trans message="Channels" />
          </BreadcrumbItem>
          <BreadcrumbItem>{channel.name}</BreadcrumbItem>
        </Breadcrumb>
      }
      isLoading={updateChannel.isPending}
    >
      {children}
    </CrupdateResourceLayout>
  );
}
