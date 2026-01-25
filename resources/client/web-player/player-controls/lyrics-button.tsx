import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {MediaMicrophoneIcon} from '@ui/icons/media/media-microphone';
import {useSettings} from '@ui/settings/use-settings';
import {Tooltip} from '@ui/tooltip/tooltip';
import {useLocation, useMatch} from 'react-router';

export function LyricsButton() {
  const {player} = useSettings();
  const track = useCuedTrack();
  const navigate = useNavigate();
  const isOnLyricsPage = !!useMatch('/lyrics');
  const {key} = useLocation();
  const hasPreviousUrl = key !== 'default';
  const isOffline = useIsOffline();
  const isDisabled = isOffline || !track || player?.hide_lyrics;

  if (!track || player?.hide_lyrics) {
    return null;
  }

  return (
    <Tooltip label={<Trans message="Lyrics" />}>
      <IconButton
        disabled={isDisabled}
        onClick={() => {
          if (isOnLyricsPage) {
            if (hasPreviousUrl) {
              navigate(-1);
            }
          } else {
            navigate(`/lyrics`);
          }
        }}
        color={isOnLyricsPage ? 'primary' : undefined}
      >
        <MediaMicrophoneIcon />
      </IconButton>
    </Tooltip>
  );
}
