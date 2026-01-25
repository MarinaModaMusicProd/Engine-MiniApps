import {appQueries} from '@app/app-queries';
import {ProfileDetails} from '@app/web-player/users/user-profile/profile-details';
import {useAuth} from '@common/auth/use-auth';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';
import {UseFormReturn} from 'react-hook-form';
import {ProfileLink} from '../user-profile';

export interface UpdateProfilePayload {
  user: {
    image?: string | null;
    image_entry_id?: number | null;
    name?: string;
    username?: string;
  };
  profile: ProfileDetails;
  links: ProfileLink[];
}

export function useUpdateUserProfile(
  form: UseFormReturn<UpdateProfilePayload>,
) {
  const {user} = useAuth();
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiClient.put('users/profile/update', payload).then(r => r.data),
    onSuccess: () => {
      toast(trans(message('Profile updated')));
      if (user) {
        queryClient.invalidateQueries({
          queryKey: appQueries.userProfile(user.id).details.queryKey,
        });
      }
    },
    onError: err => onFormQueryError(err, form),
  });
}
