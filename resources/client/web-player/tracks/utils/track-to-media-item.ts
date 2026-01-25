import {offlinedEntitiesStore} from '@app/offline/offline-entities-store';
import {downloadedFiles} from '@app/offline/playback-data-storage';
import {FullAlbum, PartialAlbum} from '@app/web-player/albums/album';
import {Track} from '@app/web-player/tracks/track';
import {MediaItem} from '@common/player/media-item';
import {guessPlayerProvider} from '@common/player/utils/guess-player-provider';

export async function trackToMediaItem(
  track: Track,
  queueGroupId?: string | number,
): Promise<MediaItem<Track>> {
  const provider: MediaItem['provider'] = track.src
    ? guessPlayerProvider(track.src)
    : 'youtube';

  if (offlinedEntitiesStore().isTrackOfflined(track.id)) {
    const entry = await downloadedFiles.getByTrackId(track.id);
    if (entry) {
      return {
        id: track.id,
        provider: 'htmlAudio',
        src: `stream/offlined-media/${track.id}.${entry.extension}`,
        meta: track,
        poster: track.image,
        groupId: queueGroupId,
      };
    }
  }

  if (!track.src || provider === 'youtube') {
    return {
      id: track.id,
      provider: 'youtube',
      meta: track,
      src: track.src ? track.src : 'resolve',
      groupId: queueGroupId,
    };
  }

  return {
    id: track.id,
    src: track.src,
    provider,
    meta: track,
    poster: track.image,
    groupId: queueGroupId,
  };
}

export async function tracksToMediaItems(
  tracks: Track[],
  queueGroupId?: string,
  album?: PartialAlbum,
): Promise<MediaItem<Track>[]> {
  return Promise.all(
    tracks.map(track => {
      if (album && !track.album) {
        track = {
          ...track,
          album: {...album},
        };
        delete (track.album as FullAlbum).tracks;
      }
      return trackToMediaItem(track, queueGroupId);
    }),
  );
}
