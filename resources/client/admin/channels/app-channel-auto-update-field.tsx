import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {ChannelAutoUpdateField} from '@common/admin/channels/channel-editor/controls/channel-auto-update-field';
import {message} from '@ui/i18n/message';
import {useSettings} from '@ui/settings/use-settings';
import {useMemo} from 'react';

interface Props {
  className?: string;
  config: ChannelContentConfig;
}
export function AppChannelAutoUpdateField({className, config}: Props) {
  const {spotify_is_setup} = useSettings();

  const providers = useMemo(() => {
    const providers = [
      {label: message('Local database'), value: 'local'},
      {label: message('Deezer'), value: 'deezer'},
    ];
    if (spotify_is_setup) {
      providers.push({label: message('Spotify'), value: 'spotify'});
    }
    return providers;
  }, [spotify_is_setup]);

  return (
    <ChannelAutoUpdateField
      config={config}
      providers={providers}
      className={className}
    />
  );
}
