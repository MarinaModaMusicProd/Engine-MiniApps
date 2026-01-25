import {useAuth} from '@common/auth/use-auth';
import {useFollowUser} from '@common/users/queries/use-follow-user';
import {useIsUserFollowing} from '@common/users/queries/use-followed-users';
import {useUnfollowUser} from '@common/users/queries/use-unfollow-user';
import {Button, ButtonProps} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';

interface Props extends Omit<ButtonProps, 'onClick' | 'disabled'> {
  user: {
    id: number;
    name: string;
  };
  minWidth?: string | null;
}
export function FollowButton({
  user,
  className,
  minWidth = 'min-w-82',
  ...buttonProps
}: Props) {
  const {user: currentUser} = useAuth();
  const {isFollowing, isLoading} = useIsUserFollowing(user.id);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const mergedClassName = clsx(className, minWidth);

  if (isFollowing) {
    return (
      <Button
        {...buttonProps}
        className={mergedClassName}
        onClick={() => unfollowUser.mutate({user})}
        disabled={
          !currentUser ||
          currentUser?.id === user.id ||
          unfollowUser.isPending ||
          isLoading
        }
      >
        <Trans message="Unfollow" />
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      className={mergedClassName}
      onClick={() => followUser.mutate({user})}
      disabled={
        !currentUser ||
        currentUser?.id === user.id ||
        followUser.isPending ||
        isLoading
      }
    >
      <Trans message="Follow" />
    </Button>
  );
}
