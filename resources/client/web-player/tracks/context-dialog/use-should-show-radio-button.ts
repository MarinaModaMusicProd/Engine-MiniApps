import {useSettings} from '@ui/settings/use-settings';

export function useShouldShowRadioButton(): boolean {
  const {player, artist_provider, spotify_use_deprecated_api} = useSettings();
  return (
    !player?.hide_radio_button &&
    artist_provider === 'spotify' &&
    !!spotify_use_deprecated_api
  );
}
