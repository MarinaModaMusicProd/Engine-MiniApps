import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {ContextMenuButton} from '@app/web-player/context-dialog/context-dialog-layout';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {ShareMediaDialog} from '@app/web-player/sharing/share-media-dialog';
import {Track} from '@app/web-player/tracks/track';
import {Trans} from '@ui/i18n/trans';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {openDialog} from '@ui/overlays/store/dialog-store';

interface Props {
  item: Track | PartialAlbum | PartialArtist | PartialPlaylist;
}
export function ShareMediaButton({item}: Props) {
  const {close: closeMenu} = useDialogContext();
  return (
    <ContextMenuButton
      enableWhileOffline
      onClick={() => {
        closeMenu();
        openDialog(ShareMediaDialog, {
          item,
        });
      }}
    >
      <Trans message="Share" />
    </ContextMenuButton>
  );
}
