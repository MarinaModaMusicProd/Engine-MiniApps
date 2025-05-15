import {useAuth} from '@common/auth/use-auth';
import {useThemeSelector} from '@ui/themes/theme-selector-context';
import {Badge} from '@ui/badge/badge';
import {ButtonBase} from '@ui/buttons/button-base';
import {ArrowDropDownIcon} from '@ui/icons/material/ArrowDropDown';
import {ReactElement} from 'react';
import {ListboxItemProps} from '@ui/forms/listbox/item';
import {NavbarAuthMenu} from '@common/ui/navigation/navbar/navbar-auth-menu';
import {UserAvatar} from '@common/auth/user-avatar';

export interface NavbarAuthUserProps {
  items?: ReactElement<ListboxItemProps>[];
  variant?: 'wide' | 'compact';
  wideAvatarSize?: string;
  compactAvatarSize?: string;
}
export function NavbarAuthUser({
  items = [],
  variant = 'wide',
  wideAvatarSize = 'w-32 h-32',
  compactAvatarSize = 'w-26 h-26',
}: NavbarAuthUserProps) {
  const {user} = useAuth();
  const {selectedTheme} = useThemeSelector();
  if (!selectedTheme || !user) return null;
  const hasUnreadNotif = !!user.unread_notifications_count;

  const avatar = (
    <UserAvatar
      user={user}
      circle
      fallback="initials"
      withLink={false}
      size={variant === 'wide' ? wideAvatarSize : compactAvatarSize}
    />
  );

  const compactButton = (
    <ButtonBase aria-label="toggle authentication menu" display="block">
      {avatar}
      {hasUnreadNotif ? (
        <Badge>{user.unread_notifications_count}</Badge>
      ) : undefined}
    </ButtonBase>
  );
  const wideButton = (
    <ButtonBase className="flex items-center">
      {avatar}
      <span className="ml-12 mr-2 block max-w-124 overflow-x-hidden overflow-ellipsis text-sm">
        {user.name}
      </span>
      <ArrowDropDownIcon className="block icon-sm" />
    </ButtonBase>
  );

  return (
    <NavbarAuthMenu items={items}>
      <span>{variant === 'wide' ? wideButton : compactButton}</span>
    </NavbarAuthMenu>
  );
}
