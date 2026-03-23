import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {trackIsLocallyUploaded} from '@app/web-player/tracks/utils/track-is-locally-uploaded';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useAuth} from '@common/auth/use-auth';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {DownloadIcon} from '@ui/icons/material/Download';
import {useSettings} from '@ui/settings/use-settings';
import {Tooltip} from '@ui/tooltip/tooltip';
import {downloadFileFromUrl} from '@ui/utils/files/download-file-from-url';

export function DownloadTrackButton() {
  const {player, base_url} = useSettings();
  const track = useCuedTrack();
  const {hasPermission} = useAuth();
  const isOffline = useIsOffline();

  if (
    !player?.enable_download ||
    !track ||
    !trackIsLocallyUploaded(track) ||
    !hasPermission('music.download') ||
    isOffline
  ) {
    return null;
  }

  return (
    <Tooltip label={<Trans message="Download" />}>
      <IconButton
        onClick={() => {
          downloadFileFromUrl(`${base_url}/tracks/${track.id}/download`);
        }}
      >
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  );
}
