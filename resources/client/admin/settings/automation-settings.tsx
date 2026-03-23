import {AdminDocsUrls} from '@app/admin/admin-config';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {SectionHelper} from '@common/ui/other/section-helper';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Item} from '@ui/forms/listbox/item';
import {FormSelect, Option} from '@ui/forms/select/select';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {message} from '@ui/i18n/message';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {getLanguageList} from '@ui/utils/intl/languages';
import {useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';

interface MetadataProviderConfig {
  name: 'deezer' | 'spotify';
  label: MessageDescriptor;
  canBeMainProvider: boolean;
  credentials: {name: string; label: MessageDescriptor}[];
}

const AVAILABLE_METADATA_PROVIDERS: MetadataProviderConfig[] = [
  {
    name: 'deezer',
    label: message('Deezer'),
    canBeMainProvider: true,
    credentials: [],
  },
  {
    name: 'spotify',
    label: message('Spotify'),
    canBeMainProvider: true,
    credentials: [
      {name: 'spotify_id', label: message('Spotify ID')},
      {name: 'spotify_secret', label: message('Spotify secret')},
    ],
  },
] as const;

export function Component() {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        metadata_provider: data.client.metadata_provider ?? 'none',
        search_provider: data.client.search_provider ?? 'local',
        artist_bio_provider: data.client.artist_bio_provider ?? 'local',
        wikipedia_language: data.client.wikipedia_language ?? 'en',
        player: {
          lyrics_automate: data.client.player?.lyrics_automate ?? false,
        },
      },
      server: {
        spotify_id: data.server.spotify_id ?? '',
        spotify_secret: data.server.spotify_secret ?? '',
      },
    },
  });

  return (
    <AdminSettingsLayout
      form={form}
      title={<Trans message="Content automation" />}
      docsLink={AdminDocsUrls.settings.automation}
    >
      <MainProviderSection />
      <ArtistBiographySection />
      <SearchProviderSection />
      <LyricsAutomationSection />
    </AdminSettingsLayout>
  );
}

function MainProviderSection() {
  const [originalProvider] = useState(
    () => getBootstrapData().settings.metadata_provider,
  );
  const selectedProvider = useWatch<AdminSettings, 'client.metadata_provider'>({
    name: 'client.metadata_provider',
  });
  const shouldWarnAboutProviderChange =
    originalProvider !== selectedProvider &&
    originalProvider !== 'local' &&
    selectedProvider !== 'local';
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Music metadata provider" />}
      description={
        <Trans message="Select which provider should be used for importing and updating data about artists, albums and tracks." />
      }
    >
      <FormSelect
        size="sm"
        selectionMode="single"
        name="client.metadata_provider"
        label={<Trans message="Selected provider" />}
      >
        <Option value="local">
          <Trans message="Local database" />
        </Option>
        {AVAILABLE_METADATA_PROVIDERS.filter(
          provider => provider.canBeMainProvider,
        ).map(provider => (
          <Option value={provider.name} key={provider.name}>
            <Trans {...provider.label} />
          </Option>
        ))}
      </FormSelect>
      <ProviderCredentialFields providerName={selectedProvider ?? 'none'} />
      {shouldWarnAboutProviderChange && (
        <SectionHelper
          className="mt-12"
          size="sm"
          color="danger"
          description={
            <Trans message="Changing from one external provider to another can result in duplicate artists, albums or tracks being imported." />
          }
        />
      )}
    </SettingsPanel>
  );
}

type ProviderCredentialFieldsProps = {
  providerName: string;
};
function ProviderCredentialFields({
  providerName,
}: ProviderCredentialFieldsProps) {
  if (providerName === 'spotify') {
    return (
      <div className="mt-12 flex items-center gap-12">
        <FormTextField
          className="flex-1"
          size="sm"
          name="server.spotify_id"
          label={<Trans message="Spotify ID" />}
          required
        />
        <FormTextField
          className="flex-1"
          size="sm"
          name="server.spotify_secret"
          label={<Trans message="Spotify secret" />}
          required
        />
      </div>
    );
  }
}

function ArtistBiographySection() {
  const languages = getLanguageList();
  const selectedProvider = useWatch<
    AdminSettings,
    'client.artist_bio_provider'
  >({
    name: 'client.artist_bio_provider',
  });
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Artist biography provider" />}
      description={
        <Trans message="Configure where artist biographies are fetched from." />
      }
    >
      <div className="flex gap-12">
        <FormSelect
          size="sm"
          className="flex-1"
          name="client.artist_bio_provider"
          label={<Trans message="Artist biography provider" />}
          labelDisplay="hidden"
          selectionMode="single"
        >
          <Item value="wikipedia">
            <Trans message="Wikipedia" />
          </Item>
          <Item value="local">
            <Trans message="Local database" />
          </Item>
        </FormSelect>
        {selectedProvider === 'wikipedia' && (
          <FormSelect
            size="sm"
            name="client.wikipedia_language"
            className="flex-1"
            label={<Trans message="Language" />}
            labelDisplay="hidden"
            selectionMode="single"
            showSearchField
          >
            {languages.map(language => (
              <Item value={language.code} key={language.code}>
                {language.name}
              </Item>
            ))}
          </FormSelect>
        )}
      </div>
    </SettingsPanel>
  );
}

function SearchProviderSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Search method" />}
      description={
        <Trans message="Configure which method should be used for user facing search in the web player." />
      }
    >
      <FormSelect
        size="sm"
        name="client.search_provider"
        selectionMode="single"
        label={<Trans message="Search method" />}
        labelDisplay="hidden"
      >
        <Item
          value="external"
          description={
            <Trans message="Main search on the site will use selected provider to find artist, album and track matches." />
          }
        >
          <Trans message="Selected metadata provider" />
        </Item>
        <Item
          value="local"
          description={
            <Trans message="Will only search content available in the local database." />
          }
        >
          <Trans message="Local database" />
        </Item>
        <Item
          value="local_and_external"
          description={
            <Trans message="Combine results from local and external providers. Local results are preferred." />
          }
        >
          <Trans message="Local and external" />
        </Item>
      </FormSelect>
    </SettingsPanel>
  );
}

function LyricsAutomationSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Lyrics Automation" />}
      description={
        <Trans message="Try to automatically find and import lyrics based on song and artist name. Lyrics can still be added manually, if this is disabled." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.player.lyrics_automate"
        value="spotify"
      >
        <Trans message="Enable lyrics automation" />
      </FormSwitch>
    </SettingsPanel>
  );
}
