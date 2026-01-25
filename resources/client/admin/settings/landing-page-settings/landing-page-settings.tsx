import {ChannelSectionSettings} from '@app/admin/settings/landing-page-settings/channel-section-settings';
import {Component as CommonLandingPageSettings} from '@common/admin/settings/landing-page-settings/landing-page-settings';
import {
  LandingPageSettingsContext,
  LandingPageSettingsContextValue,
} from '@common/admin/settings/landing-page-settings/landing-page-settings-context';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';

const contextValue: LandingPageSettingsContextValue = {
  customSections: {
    channel: {
      label: message('Channel'),
      component: ChannelSectionSettings,
    },
  },
  heroSettings: HeroSettings,
};

export function Component() {
  return (
    <LandingPageSettingsContext.Provider value={contextValue}>
      <CommonLandingPageSettings />
    </LandingPageSettingsContext.Provider>
  );
}

type HeroSettingsProps = {
  formPrefix: string;
};
function HeroSettings({formPrefix}: HeroSettingsProps) {
  return (
    <div className="mt-12">
      <FormSwitch name={`${formPrefix}.showSearchBarSlot`}>
        <Trans message="Show search bar" />
      </FormSwitch>
    </div>
  );
}
