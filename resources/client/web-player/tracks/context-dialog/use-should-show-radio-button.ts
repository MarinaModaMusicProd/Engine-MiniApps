import {useSettings} from '@ui/settings/use-settings';

export function useShouldShowRadioButton(): boolean {
  const {player, metadata_provider, spotify_use_deprecated_api} = useSettings();
  return (
    (!player?.hide_radio_button &&
      metadata_provider === 'spotify' &&
      !!spotify_use_deprecated_api) ||
    metadata_provider === 'deezer'
  );
}
