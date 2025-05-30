import {List, ListItem} from '@ui/list/list';
import {PersonIcon} from '@ui/icons/material/Person';
import {Trans} from '@ui/i18n/trans';
import {LoginIcon} from '@ui/icons/material/Login';
import {LockIcon} from '@ui/icons/material/Lock';
import {PhonelinkLockIcon} from '@ui/icons/material/PhonelinkLock';
import {LanguageIcon} from '@ui/icons/material/Language';
import {ApiIcon} from '@ui/icons/material/Api';
import {DangerousIcon} from '@ui/icons/material/Dangerous';
import {ReactNode, useContext} from 'react';
import {DevicesIcon} from '@ui/icons/material/Devices';
import {useAuth} from '@common/auth/use-auth';
import {useSettings} from '@ui/settings/use-settings';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import {useAllSocialLoginsDisabled} from '@common/auth/ui/use-all-social-logins-disabled';

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

export function AccountSettingsSidenav() {
  const p = AccountSettingsId;

  const {hasPermission} = useAuth();
  const {api} = useSettings();
  const {auth} = useContext(SiteConfigContext);

  const allSocialsDisabled = useAllSocialLoginsDisabled();

  return (
    <aside className="sticky top-[74px] hidden flex-shrink-0 lg:block">
      <List padding="p-0">
        {auth.accountSettingsPanels?.map(panel => (
          <Item
            key={panel.id}
            icon={<panel.icon viewBox="0 0 50 50" />}
            panel={panel.id as AccountSettingsId}
          >
            <Trans {...panel.label} />
          </Item>
        ))}
        <Item icon={<PersonIcon />} panel={p.AccountDetails}>
          <Trans message="Account details" />
        </Item>
        {!allSocialsDisabled && (
          <Item icon={<LoginIcon />} panel={p.SocialLogin}>
            <Trans message="Social login" />
          </Item>
        )}
        <Item icon={<LockIcon />} panel={p.Password}>
          <Trans message="Password" />
        </Item>
        <Item icon={<PhonelinkLockIcon />} panel={p.TwoFactor}>
          <Trans message="Two factor authentication" />
        </Item>
        <Item icon={<DevicesIcon />} panel={p.Sessions}>
          <Trans message="Active sessions" />
        </Item>
        <Item icon={<LanguageIcon />} panel={p.LocationAndLanguage}>
          <Trans message="Location and language" />
        </Item>
        {api?.integrated && hasPermission('api.access') ? (
          <Item icon={<ApiIcon />} panel={p.Developers}>
            <Trans message="Developers" />
          </Item>
        ) : null}
        <Item icon={<DangerousIcon />} panel={p.DeleteAccount}>
          <Trans message="Delete account" />
        </Item>
      </List>
    </aside>
  );
}

interface ItemProps {
  children: ReactNode;
  icon: ReactNode;
  isLast?: boolean;
  panel: AccountSettingsId;
}
function Item({children, icon, isLast, panel}: ItemProps) {
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
