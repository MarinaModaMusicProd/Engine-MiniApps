import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {HeadphonesIcon, SettingsIcon, UserPenIcon} from 'lucide-react';
import {ReactElement} from 'react';

export const authDropdownIcons: Record<string, ReactElement<SvgIconProps>> = {
  '/admin/reports': <LucideIcon icon={SettingsIcon} />,
  '/account-settings': <LucideIcon icon={UserPenIcon} />,
  '/': <LucideIcon icon={HeadphonesIcon} />,
};
