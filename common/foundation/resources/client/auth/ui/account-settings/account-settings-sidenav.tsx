import {useAllSocialLoginsDisabled} from '@common/auth/ui/use-all-social-logins-disabled';
import {useAuth} from '@common/auth/use-auth';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {List, ListItem} from '@ui/list/list';
import {useSettings} from '@ui/settings/use-settings';
import {
  CodeIcon,
  FingerprintPatternIcon,
  GlobeIcon,
  LockIcon,
  LogInIcon,
  MonitorSmartphoneIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import {ReactNode} from 'react';

export enum AccountSettingsId {
  AccountDetails = 'account-details',
  SocialLogin = 'social-login',
  Password = 'password',
  TwoFactor = 'two-factor',
  LocationAndLanguage = 'location-and-language',
  Developers = 'developers',
  DeleteAccount = 'delete-account',
  Sessions = 'sessions',
}

interface Props {
  items: ReactNode;
}
export function AccountSettingsSidenav({items}: Props) {
  const p = AccountSettingsId;

  const {hasPermission} = useAuth();
  const {api} = useSettings();

  const allSocialsDisabled = useAllSocialLoginsDisabled();

  return (
    <aside className="sticky top-[74px] hidden flex-shrink-0 lg:block">
      <List padding="p-0">
        {items}
        <AccountSettingsSidenavItem
          icon={<LucideIcon icon={UserIcon} size="xs" />}
          panel={p.AccountDetails}
        >
          <Trans message="Account details" />
        </AccountSettingsSidenavItem>
        {!allSocialsDisabled && (
          <AccountSettingsSidenavItem
            icon={<LucideIcon icon={LogInIcon} size="xs" />}
            panel={p.SocialLogin}
          >
            <Trans message="Social login" />
          </AccountSettingsSidenavItem>
        )}
        <AccountSettingsSidenavItem
          icon={<LucideIcon icon={LockIcon} size="xs" />}
          panel={p.Password}
        >
          <Trans message="Password" />
        </AccountSettingsSidenavItem>
        <AccountSettingsSidenavItem
          icon={<LucideIcon icon={FingerprintPatternIcon} size="xs" />}
          panel={p.TwoFactor}
        >
          <Trans message="Two factor authentication" />
        </AccountSettingsSidenavItem>
        <AccountSettingsSidenavItem
          icon={<LucideIcon icon={MonitorSmartphoneIcon} size="xs" />}
          panel={p.Sessions}
        >
          <Trans message="Active sessions" />
        </AccountSettingsSidenavItem>
        <AccountSettingsSidenavItem
          icon={<LucideIcon icon={GlobeIcon} size="xs" />}
          panel={p.LocationAndLanguage}
        >
          <Trans message="Location and language" />
        </AccountSettingsSidenavItem>
        {api?.integrated && hasPermission('api.access') ? (
          <AccountSettingsSidenavItem
            icon={<LucideIcon icon={CodeIcon} size="xs" />}
            panel={p.Developers}
          >
            <Trans message="Developers" />
          </AccountSettingsSidenavItem>
        ) : null}
        <AccountSettingsSidenavItem
          icon={<LucideIcon icon={Trash2Icon} size="xs" />}
          panel={p.DeleteAccount}
        >
          <Trans message="Delete account" />
        </AccountSettingsSidenavItem>
      </List>
    </aside>
  );
}

interface ItemProps {
  children: ReactNode;
  icon: ReactNode;
  isLast?: boolean;
  panel: string;
}
export function AccountSettingsSidenavItem({
  children,
  icon,
  isLast,
  panel,
}: ItemProps) {
  return (
    <ListItem
      startIcon={icon}
      className={isLast ? undefined : 'mb-10'}
      onSelected={() => {
        const panelEl = document.querySelector(`#${panel}`);
        if (panelEl) {
          panelEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }}
    >
      {children}
    </ListItem>
  );
}
