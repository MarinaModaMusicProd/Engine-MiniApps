import {appQueries} from '@app/app-queries';
import {useAuth} from '@common/auth/use-auth';
import {useQuery} from '@tanstack/react-query';

export function useIsFollowingPlaylist(playlistId: number): boolean {
  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());
  const {user} = useAuth();
  // if user is playlist creator, then he is not following it
  const playlist = data?.find(p => p.id === +playlistId);
  if (playlist && user && user.id !== playlist.owner_id) {
    return true;
  }
  return false;
}
