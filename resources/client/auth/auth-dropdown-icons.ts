import {UserPenIcon} from '@ui/icons/lucide/user-pen-icon';
import {AudiotrackIcon} from '@ui/icons/material/Audiotrack';
import {SettingsIcon} from '@ui/icons/material/Settings';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {ComponentType} from 'react';

export const authDropdownIcons: Record<string, ComponentType<SvgIconProps>> = {
  '/admin/reports': SettingsIcon,
  '/account-settings': UserPenIcon,
  '/': AudiotrackIcon,
};
