import {FormSelect} from '@ui/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {useForm, useFormContext} from 'react-hook-form';
import {Item} from '@ui/forms/listbox/item';
import React, {Fragment} from 'react';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {
  AdminSettingsForm,
  AdminSettingsLayout,
} from '@common/admin/settings/form/admin-settings-form';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsWithFiles} from '@common/admin/settings/requests/use-update-admin-settings';
import {SettingsErrorGroup} from '@common/admin/settings/form/settings-error-group';
import {LearnMoreLink} from '@common/admin/settings/form/learn-more-link';

export function AutomationSettings() {
  return (
    <AdminSettingsLayout
      title={<Trans message="Content automation" />}
      description={
        <Trans message="Select and configure providers that will be used to automatically import artist, album, track and other content." />
      }
    >
      {data => <Form data={data} />}
    </AdminSettingsLayout>
  );
}

interface FormProps {
  data: AdminSettings;
}
function Form({data}: FormProps) {
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
    <AdminSettingsForm form={form}>
      <div className="mb-20 border-b">
        <FormSwitch
          className="mb-24"
          name="client.artist_provider"
          value="spotify"
          description={
            <Trans message="This will automatically import, and periodically update, all metadata available on spotify about the artist when user visits that artist's page." />
          }
        >
          <Trans message="Artist automation" />
        </FormSwitch>
        <WikipediaFields />
      </div>
      <FormSwitch
        className="mb-24"
        name="client.album_provider"
        value="spotify"
        description={
          <Trans message="This will automatically import, and periodically update, all metadata available on spotify about an when user visits that album's page." />
        }
      >
        <Trans message="Album automation" />
      </FormSwitch>
      <FormSelect
        className="mb-24"
        name="client.search_provider"
        selectionMode="single"
        label={<Trans message="Search method" />}
        description={
          <Trans message="Which method should be used for user facing search in the web player." />
        }
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
      <SpotifyFields />
      <FormSwitch
        className="mb-24"
        name="client.player.lyrics_automate"
        value="spotify"
        description={
          <Trans message="Try to automatically find and import lyrics based on song and artist name. Lyrics can still be added manually, if this is disabled." />
        }
      >
        <Trans message="Lyrics automation" />
      </FormSwitch>
    </AdminSettingsForm>
  );
}

function WikipediaFields() {
  const {watch} = useFormContext<AdminSettingsWithFiles>();
  return (
    <Fragment>
      <FormSelect
        className="mb-24"
        name="client.artist_bio_provider"
        selectionMode="single"
        label={<Trans message="Artist biography provider" />}
        description={
          <Trans message="Which method should be used for user facing search in the web player." />
        }
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
        <FormTextField
          className="mb-24"
          minLength={2}
          maxLength={2}
          name="client.wikipedia_language"
          label={<Trans message="Wikipedia language" />}
          description={
            <Trans message="ISO 639-1 (two letter) language code." />
          }
        />
      )}
    </Fragment>
  );
}

function SpotifyFields() {
  const {watch: w} = useFormContext<AdminSettingsWithFiles>();
  const shouldShow = [
    w('client.artist_provider'),
    w('client.album_provider'),
    w('client.search_provider'),
  ].some(provider => `${provider}`.toLowerCase().includes('spotify'));

  if (!shouldShow) {
    return null;
  }

  return (
    <Fragment>
      <SettingsErrorGroup name="spotify_group">
        {isInvalid => (
          <Fragment>
            <FormTextField
              invalid={isInvalid}
              name="server.spotify_id"
              label={<Trans message="Spotify ID" />}
              className="mb-24"
              required
            />
            <FormTextField
              invalid={isInvalid}
              name="server.spotify_secret"
              label={<Trans message="Spotify secret" />}
              required
              description={
                <LearnMoreLink link="https://support.MarinaModa.com/help-center/articles/28/34/165/spotify-credentials" />
              }
            />
          </Fragment>
        )}
      </SettingsErrorGroup>
      <FormTextField
        className="mb-24"
        name="server.lastfm_api_key"
        label={<Trans message="LastFM Api Key" />}
        description={
          <LearnMoreLink link="https://support.MarinaModa.com/help-center/articles/28/34/166/lastfm-credentials" />
        }
      />
    </Fragment>
  );
}
