import {
  ImportArtistPayload,
  useImportArtist,
} from '@app/admin/artist-datatable-page/requests/use-import-artist';
import {Button} from '@ui/buttons/button';
import {Form} from '@ui/forms/form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {FormSelect, Option} from '@ui/forms/select/select';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {Trans} from '@ui/i18n/trans';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {useSettings} from '@ui/settings/use-settings';
import {useForm, useWatch} from 'react-hook-form';

export function ImportMetadataProviderFields() {
  const {spotify_is_setup} = useSettings();
  const selectedMetadataProvider = useWatch({
    name: 'metadataProvider',
  });
  return (
    <>
      <FormSelect
        className="mb-16"
        name="metadataProvider"
        selectionMode="single"
        label={<Trans message="Provider" />}
      >
        <Option value="deezer">
          <Trans message="Deezer" />
        </Option>
        {!!spotify_is_setup && (
          <Option value="spotify">
            <Trans message="Spotify" />
          </Option>
        )}
      </FormSelect>
      {selectedMetadataProvider === 'spotify' && (
        <FormTextField
          autoFocus
          name="spotifyId"
          minLength={22}
          maxLength={22}
          label={<Trans message="Spotify ID" />}
          required
        />
      )}
      {selectedMetadataProvider === 'deezer' && (
        <FormTextField
          autoFocus
          name="deezerId"
          label={<Trans message="Deezer ID" />}
          type="number"
          required
        />
      )}
    </>
  );
}

export function ImportArtistDialog() {
  const settings = useSettings();
  const {spotify_is_setup} = useSettings();
  const defaultMetadataProvider =
    settings.metadata_provider === 'spotify' && !!spotify_is_setup
      ? 'spotify'
      : 'deezer';
  const form = useForm<ImportArtistPayload>({
    defaultValues: {
      metadataProvider: defaultMetadataProvider,
      importAlbums: true,
      importSimilarArtists: true,
    },
  });
  const selectedMetadataProvider = useWatch({
    control: form.control,
    name: 'metadataProvider',
  });
  const {formId, close} = useDialogContext();
  const importArtist = useImportArtist();
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Import artist" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values => {
            importArtist.mutate(values, {
              onSuccess: response => {
                close(response.artist);
              },
            });
          }}
        >
          <ImportMetadataProviderFields />
          <FormSwitch name="importAlbums" className="my-16">
            <Trans message="Import albums" />
          </FormSwitch>
          {(settings.spotify_use_deprecated_api ||
            selectedMetadataProvider !== 'spotify') && (
            <FormSwitch name="importSimilarArtists">
              <Trans message="Import similar artists" />
            </FormSwitch>
          )}
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
          disabled={importArtist.isPending}
        >
          <Trans message="Import" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
