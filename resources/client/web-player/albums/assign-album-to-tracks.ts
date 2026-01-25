import {FullAlbum, PartialAlbum} from '@app/web-player/albums/album';

export function assignAlbumToTracks<T extends FullAlbum | PartialAlbum>(
  album: T,
): T {
  if ('tracks' in album && album.tracks?.length) {
    album.tracks = album.tracks?.map(track => {
      if (!track.album) {
        track.album = {...album};
        delete (track.album as FullAlbum).tracks;
      }
      return track;
    });
  }

  return album;
}
