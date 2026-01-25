import {UserArtist} from '@app/web-player/users/user-profile';
import {useAuth} from '@common/auth/use-auth';

export function usePrimaryArtistForCurrentUser(): UserArtist | undefined {
  const {user} = useAuth();
  return user?.artists?.find(a => a.role === 'artist');
}
