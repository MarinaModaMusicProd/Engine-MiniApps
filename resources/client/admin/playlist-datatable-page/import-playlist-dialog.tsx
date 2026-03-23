import {ImportMetadataProviderFields} from '@app/admin/artist-datatable-page/import-artist-dialog';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {Trans} from '@ui/i18n/trans';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useForm} from 'react-hook-form';
import {
  ImportPlaylistPayload,
  useImportPlaylist,
} from '@app/admin/playlist-datatable-page/requests/use-import-playlist';
import {Form} from '@ui/forms/form';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {Button} from '@ui/buttons/button';
import {useSettings} from '@ui/settings/use-settings';

export function ImportPlaylistDialog() {
  const settings = useSettings();
  const {spotify_is_setup} = useSettings();
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';
  const form = useForm<ImportPlaylistPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
    },
  });
  const {formId, close} = useDialogContext();
  const importPlaylist = useImportPlaylist();
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Import playlist" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values => {
            importPlaylist.mutate(values, {
              onSuccess: response => {
                close(response.playlist);
              },
            });
          }}
        >
          <ImportMetadataProviderFields />
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
          disabled={importPlaylist.isPending}
        >
          <Trans message="Import" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
