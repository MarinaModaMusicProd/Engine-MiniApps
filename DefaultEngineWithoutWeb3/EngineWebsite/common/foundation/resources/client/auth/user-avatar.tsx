import {Avatar, AvatarProps} from '@ui/avatar/avatar';
import {useContext} from 'react';
import {SiteConfigContext} from '@common/core/settings/site-config-context';

export interface UserAvatarProps
  extends Omit<AvatarProps, 'label' | 'src' | 'link'> {
  user: {id: number | string; name: string; image?: string};
  withLink?: boolean;
}
export function UserAvatar({user, withLink = true, ...props}: UserAvatarProps) {
  const {auth} = useContext(SiteConfigContext);
  return (
    <Avatar
      {...props}
      label={user?.name}
      src={user?.image}
      link={withLink && user?.id && auth.getUserProfileLink?.(user)}
    />
  );
}
