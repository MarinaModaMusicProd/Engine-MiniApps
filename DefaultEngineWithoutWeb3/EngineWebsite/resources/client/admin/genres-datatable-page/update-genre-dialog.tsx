import {CrupdateGenreFrom} from '@app/admin/genres-datatable-page/crupdate-genre-form';
import {useImportGenreArtists} from '@app/admin/genres-datatable-page/requests/use-import-genre-artists';
import {
  UpdateGenrePayload,
  useUpdateGenre,
} from '@app/admin/genres-datatable-page/requests/use-update-genre';
import {Genre} from '@app/web-player/genres/genre';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {useSettings} from '@ui/settings/use-settings';
import {useForm} from 'react-hook-form';

interface Props {
  genre: Genre;
}
export function UpdateGenreDialog({genre}: Props) {
  const {spotify_is_setup, spotify_use_deprecated_api} = useSettings();
  const {close, formId} = useDialogContext();
  const form = useForm<UpdateGenrePayload>({
    defaultValues: {
      id: genre.id,
      name: genre.name,
      display_name: genre.display_name,
      image: genre.image,
    },
  });
  const updateGenre = useUpdateGenre(form);
  const importArtists = useImportGenreArtists();

  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Update “:name“ genre" values={{name: genre.name}} />
      </DialogHeader>
      <DialogBody>
        <CrupdateGenreFrom
          formId={formId}
          form={form}
          onSubmit={values => {
            updateGenre.mutate(values, {
              onSuccess: () => {
                close();
              },
            });
          }}
        />
      </DialogBody>
      <DialogFooter
        startAction={
          spotify_is_setup &&
          spotify_use_deprecated_api && (
            <Button
              variant="outline"
              onClick={() =>
                importArtists.mutate({genre}, {onSuccess: () => close()})
              }
              disabled={importArtists.isPending}
            >
              <Trans message="Import artists" />
            </Button>
          )
        }
      >
        <Button onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button
          form={formId}
          disabled={updateGenre.isPending}
          variant="flat"
          color="primary"
          type="submit"
        >
          <Trans message="Save" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
