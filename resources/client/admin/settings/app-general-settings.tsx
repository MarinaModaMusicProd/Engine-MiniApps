import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {Component as CommonGeneralSettings} from '@common/admin/settings/pages/general-settings';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {useValueLists} from '@common/http/value-lists';
import {Item} from '@ui/forms/listbox/item';
import {FormSelect} from '@ui/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {useWatch} from 'react-hook-form';

export function Component() {
  const {data} = useAdminSettings();
  return (
    <CommonGeneralSettings
      defaultValues={{
        client: {
          homepage: {
            type: data.client.homepage.type,
            value: data.client.homepage.value,
          },
        },
      }}
    >
      <HomepageSection />
    </CommonGeneralSettings>
  );
}

function HomepageSection() {
  const {data} = useValueLists(['menuItemCategories']);
  const selectedType = useWatch({name: 'client.homepage.type'});
  const channels =
    data?.menuItemCategories?.find(category => category.type === 'channel')
      ?.items ?? [];
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Homepage" />}
      description={
        <Trans message="Configure which page should be displayed as your site's homepage." />
      }
    >
      <FormSelect
        name="client.homepage.type"
        selectionMode="single"
        label={<Trans message="Site home page" />}
      >
        <Item value="channel">
          <Trans message="Channel" />
        </Item>
        <Item value="landingPage">
          <Trans message="Landing page" />
        </Item>
        <Item value="loginPage">
          <Trans message="Login page" />
        </Item>
      </FormSelect>
      {selectedType === 'channel' && (
        <FormSelect
          className="mt-20"
          name="client.homepage.value"
          selectionMode="single"
          label={<Trans message="Channel" />}
        >
          {channels.map(channel => (
            <Item key={channel.id} value={`${channel.id}`}>
              {channel.label}
            </Item>
          ))}
        </FormSelect>
      )}
    </SettingsPanel>
  );
}
