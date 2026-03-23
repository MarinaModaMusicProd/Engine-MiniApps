import {ImportMetadataProviderFields} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {
  ImportTrackPayload,
  useImportTrack,
} from '@app/admin/tracks-datatable-page/requests/use-import-track';
import {Button} from '@ui/buttons/button';
import {Form} from '@ui/forms/form';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {Trans} from '@ui/i18n/trans';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {useSettings} from '@ui/settings/use-settings';
import {useForm} from 'react-hook-form';

export function ImportTrackDialog() {
  const settings = useSettings();
  const {spotify_is_setup} = useSettings();
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';
  const form = useForm<ImportTrackPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
      importLyrics: true,
    },
  });
  const {formId, close} = useDialogContext();
  const importTrack = useImportTrack();
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Import track" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values => {
            importTrack.mutate(values, {
              onSuccess: response => {
                close(response.track);
              },
            });
          }}
        >
          <ImportMetadataProviderFields />
          <FormSwitch name="importLyrics" className="mt-16">
            <Trans message="Import lyrics" />
          </FormSwitch>
          <div className="mt-16 text-xs text-muted">
            <Trans message="This will also import all artists that collaborated on this track and album this track belongs to." />
          </div>
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button
          form={formId}
          variant="flat"
          color="primary"
          type="submit"
          disabled={importTrack.isPending}
        >
          <Trans message="Import" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
