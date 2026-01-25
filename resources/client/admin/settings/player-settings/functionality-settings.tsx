import {AdminDocsUrls} from '@app/admin/admin-config';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {LinkStyle} from '@ui/buttons/external-link';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Item} from '@ui/forms/listbox/item';
import {FormSelect} from '@ui/forms/select/select';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {ReactElement} from 'react';
import {useForm} from 'react-hook-form';

interface Props {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
}
export function FunctionalitySettings({tabs, title}: Props) {
  const {spotify_is_setup} = useSettings();
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        player: {
          sort_method: data.client.player?.sort_method ?? 'external',
          default_volume: data.client.player?.default_volume ?? 100,
          seekbar_type: data.client.player?.seekbar_type ?? 'waveform',
          enable_repost: data.client.player?.enable_repost ?? false,
          track_comments: data.client.player?.track_comments ?? false,
          show_upload_btn: data.client.player?.show_upload_btn ?? false,
          show_become_artist_btn:
            data.client.player?.show_become_artist_btn ?? false,
          enable_offlining: data.client.player?.enable_offlining ?? false,
        },
        uploads: {
          autoMatch: data.client.uploads?.autoMatch ?? false,
        },
      },
    },
  });
  return (
    <AdminSettingsLayout form={form} title={title} tabs={tabs}>
      {spotify_is_setup && <ContentPopularitySection />}
      <VolumeSettingsPanel />
      <SeekbarSection />
      <SocialFeaturesSection />
      <OfflineFunctionalitySection />
      <NavigationAccessSection />
      <ContentManagementSection />
    </AdminSettingsLayout>
  );
}

export function ContentPopularitySection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Content Popularity" />}
      description={
        <Trans message="When content is sorted by popularity (e.g. in track tables), choose whether to use Spotify popularity or local play counts." />
      }
    >
      <FormSelect
        size="sm"
        name="client.player.sort_method"
        selectionMode="single"
        label={<Trans message="Popularity source" />}
      >
        <Item value="external">
          <Trans message="Spotify popularity" />
        </Item>
        <Item value="local">
          <Trans message="Local plays" />
        </Item>
      </FormSelect>
    </SettingsPanel>
  );
}

function VolumeSettingsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Volume Settings" />}
      description={
        <Trans message="Configure default audio volume and playback settings." />
      }
    >
      <FormTextField
        size="sm"
        name="client.player.default_volume"
        label={<Trans message="Default player volume" />}
        type="number"
        min={1}
        max={100}
        description={
          <Trans message="Set the default volume level (1-100) when the player loads." />
        }
      />
    </SettingsPanel>
  );
}

export function SeekbarSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Player Seekbar" />}
      description={
        <Trans message="Choose between waveform visualization or simple line seekbar. Waveforms are generated during upload and will default to simple for auto-imported tracks." />
      }
    >
      <FormSelect
        size="sm"
        name="client.player.seekbar_type"
        selectionMode="single"
        label={<Trans message="Seekbar type" />}
      >
        <Item value="waveform">
          <Trans message="Waveform" />
        </Item>
        <Item value="line">
          <Trans message="Simple" />
        </Item>
      </FormSelect>
    </SettingsPanel>
  );
}

export function SocialFeaturesSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Social Features" />}
      description={
        <Trans message="Enable or disable social interaction features for tracks and albums." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.player.enable_repost"
        description={
          <Trans message="Allow users to repost albums and tracks to share them with their followers." />
        }
      >
        <Trans message="Enable reposts" />
      </FormSwitch>
      <FormSwitch
        size="sm"
        className="mt-24"
        name="client.player.track_comments"
        description={
          <Trans message="Allow users to leave comments on albums and tracks." />
        }
      >
        <Trans message="Enable commenting" />
      </FormSwitch>
    </SettingsPanel>
  );
}

export function OfflineFunctionalitySection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Offline playback" />}
      description={
        <Trans message="Control whether users can make music available for offline listening. Does not work for tracks with youtube as the only playback source." />
      }
    >
      <FormSwitch size="sm" name="client.player.enable_offlining">
        <Trans message="Enable offline playback functionality" />
      </FormSwitch>
    </SettingsPanel>
  );
}

export function NavigationAccessSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Navigation & Access" />}
      description={
        <Trans message="Control which navigation elements and access points are visible to users." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.player.show_upload_btn"
        description={
          <Trans message="Show upload button in the left sidebar for users with upload permissions." />
        }
      >
        <Trans message="Show upload button" />
      </FormSwitch>
      <FormSwitch
        size="sm"
        className="mt-24"
        name="client.player.show_become_artist_btn"
        description={
          <Trans
            message="Show <a>Become artist</a> menu item for users who are not yet artists."
            values={{
              a: parts => (
                <a
                  target="_blank"
                  href={AdminDocsUrls.pages.backstage}
                  className={LinkStyle}
                >
                  {parts}
                </a>
              ),
            }}
          />
        }
      >
        <Trans message="Show become artist menu" />
      </FormSwitch>
    </SettingsPanel>
  );
}

export function ContentManagementSection() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Content Management" />}
      description={
        <Trans message="Configure how uploaded content is processed and matched with existing data." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.uploads.autoMatch"
        description={
          <Trans message="Automatically match uploaded files with existing albums and artists based on metadata, or create new entries if they don't exist." />
        }
      >
        <Trans message="Enable metadata matching" />
      </FormSwitch>
    </SettingsPanel>
  );
}
