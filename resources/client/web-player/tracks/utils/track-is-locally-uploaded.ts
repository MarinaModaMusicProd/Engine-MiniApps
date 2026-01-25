import {Track} from '@app/web-player/tracks/track';

export function trackIsLocallyUploaded(track: Track): boolean {
  return track?.src != null && track.src_local;
}
