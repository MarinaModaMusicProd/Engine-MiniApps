import {AdminDocsUrls} from '@app/admin/admin-config';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {SettingsErrorGroup} from '@common/admin/settings/layout/settings-error-group';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Item} from '@ui/forms/listbox/item';
import {FormSelect} from '@ui/forms/select/select';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {Trans} from '@ui/i18n/trans';
import {getLanguageList} from '@ui/utils/intl/languages';
import {Fragment} from 'react';
import {useForm, useFormContext} from 'react-hook-form';

export function Component() {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        artist_provider: data.client.artist_provider ?? false,
        album_provider: data.client.album_provider ?? false,
        search_provider: data.client.search_provider ?? false,
        artist_bio_provider: data.client.artist_bio_provider ?? 'local',
        wikipedia_language: data.client.wikipedia_language ?? 'en',
        player: {
          lyrics_automate: data.client.player?.lyrics_automate ?? false,
        },
      },
      server: {
        spotify_id: data.server.spotify_id ?? '',
        spotify_secret: data.server.spotify_secret ?? '',
        lastfm_api_key: data.server.lastfm_api_key ?? '',
      },
    },
  });

  return (
    <AdminSettingsLayout
      form={form}
      title={<Trans message="Content automation" />}
      docsLink={AdminDocsUrls.settings.automation}
    >
      <ArtistAutomationSection />
      <AlbumAutomationSection />
      <SearchProviderSection />
      <LyricsAutomationSection />
      <SpotifyCredentialsSection />
    </AdminSettingsLayout>
  );
}

function ArtistAutomationSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Artist Automation" />}
      description={
        <Trans message="Configure automatic import and updates of artist metadata and biographies." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.artist_provider"
        value="spotify"
        description={
          <Trans message="This will automatically import, and periodically update, all metadata available on spotify about the artist when user visits that artist's page." />
        }
      >
        <Trans message="Enable artist automation" />
      </FormSwitch>
      <WikipediaFields />
    </SettingsPanel>
  );
}

function AlbumAutomationSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Album Automation" />}
      description={
        <Trans message="Configure automatic import and updates of album metadata." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.album_provider"
        value="spotify"
        description={
          <Trans message="This will automatically import, and periodically update, all metadata available on spotify about an album when user visits that album's page." />
        }
      >
        <Trans message="Enable album automation" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function SearchProviderSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Search Provider" />}
      description={
        <Trans message="Configure which method should be used for user facing search in the web player." />
      }
    >
      <FormSelect
        size="sm"
        name="client.search_provider"
        selectionMode="single"
        label={<Trans message="Search method" />}
      >
        <Item
          value="spotify"
          description={
            <Trans message="Search on the site will directly connect to, and search spotify. Any artist, album and track available on spotify will be discoverable via search, without needing to import or create it first." />
          }
        >
          <Trans message="Spotify" />
        </Item>
        <Item
          value="local"
          description={
            <Trans message="Will only search content that was created or imported from backstage or admin area. This can be further configured from 'Local search' settings page." />
          }
        >
          <Trans message="Local" />
        </Item>
        <Item
          value="localAndSpotify"
          description={
            <Trans message="Will combine search results from both 'local' and 'spotify' methods. If there are identical matches, local results will be preferred." />
          }
        >
          <Trans message="Local and spotify" />
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
        <Trans message="Configure automatic lyrics import for tracks." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.player.lyrics_automate"
        value="spotify"
        description={
          <Trans message="Try to automatically find and import lyrics based on song and artist name. Lyrics can still be added manually, if this is disabled." />
        }
      >
        <Trans message="Enable lyrics automation" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function WikipediaFields() {
  const languages = getLanguageList();
  const {watch} = useFormContext<AdminSettings>();
  return (
    <div className="mt-24 flex gap-12">
      <FormSelect
        size="sm"
        className="flex-1"
        name="client.artist_bio_provider"
        selectionMode="single"
        label={<Trans message="Artist biography provider" />}
      >
        <Item
          value="wikipedia"
          description={
            <Trans message="Will import artist biography from wikipedia in the selected language." />
          }
        >
          <Trans message="Wikipedia" />
        </Item>
        <Item
          value="local"
          description={
            <Trans message="Will only show artist biography that was manually added from admin area or backstage." />
          }
        >
          <Trans message="Local" />
        </Item>
      </FormSelect>
      {watch('client.artist_bio_provider') === 'wikipedia' && (
        <FormSelect
          size="sm"
          name="client.wikipedia_language"
          className="flex-1"
          label={<Trans message="Language" />}
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
  );
}

function SpotifyCredentialsSection() {
  const {watch: w} = useFormContext<AdminSettings>();
  const shouldShow = [
    w('client.artist_provider'),
    w('client.album_provider'),
    w('client.search_provider'),
  ].some(provider => `${provider}`.toLowerCase().includes('spotify'));

  if (!shouldShow) {
    return null;
  }

  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="API Credentials" />}
      description={
        <Trans message="Configure API credentials for external services used by automation features." />
      }
      link={
        <DocsLink link="https://support.vebto.com/hc/articles/28/34/165/spotify-credentials" />
      }
    >
      <SettingsErrorGroup
        name="spotify_group"
        separatorBottom={false}
        separatorTop={false}
      >
        {isInvalid => (
          <Fragment>
            <FormTextField
              size="sm"
              invalid={isInvalid}
              name="server.spotify_id"
              label={<Trans message="Spotify ID" />}
              required
            />
            <FormTextField
              size="sm"
              className="mt-24"
              invalid={isInvalid}
              name="server.spotify_secret"
              label={<Trans message="Spotify secret" />}
              required
            />
            <FormTextField
              size="sm"
              className="mt-24"
              name="server.lastfm_api_key"
              label={<Trans message="LastFM Api Key" />}
            />
          </Fragment>
        )}
      </SettingsErrorGroup>
    </SettingsPanel>
  );
}
