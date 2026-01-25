import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';
import {useForm} from 'react-hook-form';

type Props = {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
};

export function InterfaceSettings({tabs, title}: Props) {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        player: {
          hide_lyrics: data.client.player?.hide_lyrics ?? false,
          hide_queue: data.client.player?.hide_queue ?? false,
          hide_radio_button: data.client.player?.hide_radio_button ?? false,
          enable_download: data.client.player?.enable_download ?? false,
          hide_video_button: data.client.player?.hide_video_button ?? false,
          hide_video: data.client.player?.hide_video ?? false,
          mobile: {
            auto_open_overlay:
              data.client.player?.mobile?.auto_open_overlay ?? false,
          },
        },
      },
    },
  });
  return (
    <AdminSettingsLayout form={form} title={title} tabs={tabs}>
      <LyricsSettingsPanel />
      <RadioSettingsPanel />
      <QueueSettingsPanel />
      <DownloadSettingsPanel />
      <VideoControlsPanel />
      <MobileSettingsPanel />
    </AdminSettingsLayout>
  );
}

function LyricsSettingsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Lyrics" />}
      description={
        <Trans message="Hide the lyrics button from player controls." />
      }
    >
      <FormSwitch size="sm" name="client.player.hide_lyrics">
        <Trans message="Hide lyrics button" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function QueueSettingsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Queue" />}
      description={
        <Trans message="Hide the player queue sidebar by default. Users can still toggle it using the queue button." />
      }
    >
      <FormSwitch size="sm" className="mt-24" name="client.player.hide_queue">
        <Trans message="Hide queue sidebar" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function RadioSettingsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Radio" />}
      description={
        <Trans message="Hide 'Go to radio' buttons throughout the application." />
      }
    >
      <FormSwitch
        size="sm"
        className="mt-24"
        name="client.player.hide_radio_button"
      >
        <Trans message="Hide radio buttons" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function DownloadSettingsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Downloads" />}
      description={
        <Trans message="Show download button in player controls. Only appears if track has an audio or video file uploaded." />
      }
    >
      <FormSwitch size="sm" name="client.player.enable_download">
        <Trans message="Enable download button" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function VideoControlsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Video Controls" />}
      description={
        <Trans message="Configure video player visibility and control buttons." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.player.hide_video_button"
        description={
          <Trans message="Hide toggle fullscreen button from player controls." />
        }
      >
        <Trans message="Hide fullscreen button" />
      </FormSwitch>

      <FormSwitch
        size="sm"
        className="mt-24"
        name="client.player.hide_video"
        description={
          <Trans message="Hide the small video player in the bottom right corner by default. Note: This may cause background playback issues with YouTube embeds, especially on mobile." />
        }
      >
        <Trans message="Hide video player" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function MobileSettingsPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Mobile Settings" />}
      description={
        <Trans message="Configure mobile-specific player behavior and experience." />
      }
    >
      <FormSwitch
        size="sm"
        name="client.player.mobile.auto_open_overlay"
        description={
          <Trans message="Automatically open fullscreen video overlay on mobile when playback starts. Only applies to YouTube streaming." />
        }
      >
        <Trans message="Auto-open overlay on mobile" />
      </FormSwitch>
    </SettingsPanel>
  );
}
