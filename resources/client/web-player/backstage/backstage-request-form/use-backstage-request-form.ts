import {CreateBackstageRequestPayload} from '@app/web-player/backstage/requests/use-create-backstage-request';
import {usePrimaryArtistForCurrentUser} from '@app/web-player/backstage/use-primary-artist-for-current-user';
import {useAuth} from '@common/auth/use-auth';
import {useForm} from 'react-hook-form';

export function useBackstageRequestForm(
  requestType: CreateBackstageRequestPayload['type'],
) {
  const {user} = useAuth();
  const primaryArtist = usePrimaryArtistForCurrentUser();

  const artistId =
    requestType === 'verify-artist'
      ? (primaryArtist?.id as number | null)
      : null;

  return useForm<CreateBackstageRequestPayload>({
    defaultValues: {
      artist_id: artistId,
      artist_name: user?.name,
      name: user?.name,
      image: primaryArtist?.image || user?.image,
      type: requestType,
      role: requestType === 'claim-artist' ? 'artist' : undefined,
    },
  });
}
