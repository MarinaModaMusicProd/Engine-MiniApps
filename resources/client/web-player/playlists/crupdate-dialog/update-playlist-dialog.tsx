import {CrupdatePlaylistFields} from '@app/web-player/playlists/crupdate-dialog/crupdate-playlist-fields';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {CreatePlaylistPayload} from '@app/web-player/playlists/requests/use-create-playlist';
import {useUpdatePlaylist} from '@app/web-player/playlists/requests/use-update-playlist';
import {Button} from '@ui/buttons/button';
import {Form} from '@ui/forms/form';
import {Trans} from '@ui/i18n/trans';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {useForm} from 'react-hook-form';

interface UpdatePlaylistDialogProps {
  playlist: FullPlaylist;
}
export function UpdatePlaylistDialog({playlist}: UpdatePlaylistDialogProps) {
  const {close, formId} = useDialogContext();
  const form = useForm<CreatePlaylistPayload>({
    defaultValues: {
      name: playlist.name,
      public: playlist.public,
      collaborative: playlist.collaborative,
      image: playlist.image,
      description: playlist.description,
    },
  });
  const updatePlaylist = useUpdatePlaylist({form, playlistId: playlist.id});

  return (
    <Dialog size="xl">
      <DialogHeader>
        <Trans message="Update playlist" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values => {
            updatePlaylist.mutate(values, {
              onSuccess: response => {
                close(response.playlist);
              },
            });
          }}
        >
          <CrupdatePlaylistFields />
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button
          form={formId}
          type="submit"
          variant="flat"
          color="primary"
          disabled={updatePlaylist.isPending}
        >
          <Trans message="Update" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
