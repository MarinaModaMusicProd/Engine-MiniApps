import {
  ImportAlbumPayload,
  useImportAlbum,
} from '@app/admin/albums-datatable-page/requests/use-import-album';
import {ImportMetadataProviderFields} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {Button} from '@ui/buttons/button';
import {Form} from '@ui/forms/form';
import {Trans} from '@ui/i18n/trans';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {useSettings} from '@ui/settings/use-settings';
import {useForm} from 'react-hook-form';

export function ImportAlbumDialog() {
  const settings = useSettings();
  const {spotify_is_setup} = useSettings();
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';
  const form = useForm<ImportAlbumPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
    },
  });
  const {formId, close} = useDialogContext();
  const importAlbum = useImportAlbum();
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Import album" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values => {
            importAlbum.mutate(values, {
              onSuccess: response => {
                close(response.album);
              },
            });
          }}
        >
          <ImportMetadataProviderFields />
          <div className="mt-16 text-xs text-muted">
            <Trans message="This will also import all artists that collaborated on this album and any tracks that it contains." />
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
          disabled={importAlbum.isPending}
        >
          <Trans message="Import" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
