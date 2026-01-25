import {appQueries} from '@app/app-queries';
import {BaseOfflineDb} from '@app/offline/base-offline-db';
import {offlineQueue} from '@app/offline/offline-queue';
import {OfflinedBy, offlinedTracks} from '@app/offline/offlined-tracks';
import {FullAlbum} from '@app/web-player/albums/album';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {Track} from '@app/web-player/tracks/track';
import {queryClient} from '@common/http/query-client';

export type OfflinedMediaItem = {
  id: number;
  dbId: string;
  lastSyncedAt: number;
  type: 'album' | 'playlist';
  data: unknown;
};

class _OfflinedMediaItems extends BaseOfflineDb<OfflinedMediaItem> {
  public readonly MAX_ITEMS = 200;

  protected primaryKeyPath = 'dbId';
  protected dbName = 'offline_media_items';
  protected dbVersion = 1;
  protected dbStoreName = 'media_items';

  async addItem(item: OfflinedBy): Promise<boolean> {
    const existingItem = await this.getItem(this.refId(item));
    if (existingItem) {
      return true;
    }

    const data = await fetchMediaItemData(item);

    const newItem: OfflinedMediaItem = {
      id: item.id,
      dbId: this.refId(undefined, item),
      lastSyncedAt: Date.now(),
      type: item.model_type,
      data: data.item,
    };

    if (await this.putItem(newItem)) {
      await offlineQueue.addTracks(data.tracks, item);
    }

    return true;
  }

  async getAllPlaylists(): Promise<OfflinedMediaItem[]> {
    return this.getAllItems('type', 'playlist');
  }

  async getAllAlbums(): Promise<OfflinedMediaItem[]> {
    return this.getAllItems('type', 'album');
  }

  async getAlbumById(id: number | string): Promise<OfflinedMediaItem | null> {
    return this.getItem(
      this.refId(undefined, {id, model_type: 'album'}),
      'dbId',
    );
  }

  async getPlaylistById(
    id: number | string,
  ): Promise<OfflinedMediaItem | null> {
    return this.getItem(
      this.refId(undefined, {id, model_type: 'playlist'}),
      'dbId',
    );
  }

  async getAllPlaylistIds(): Promise<number[]> {
    return (await this.getAllKeys('type', 'playlist')).map(id =>
      parseInt(`${id}`.split('-')[0]),
    );
  }

  async getAllAlbumIds(): Promise<number[]> {
    return (await this.getAllKeys('type', 'album')).map(id =>
      parseInt(`${id}`.split('-')[0]),
    );
  }

  async delete(item: OfflinedBy): Promise<boolean> {
    await Promise.all([
      offlinedTracks.deleteTracksOfflinedBy(item),
      offlineQueue.deleteTracksQueuedBy(item),
    ]);
    return this.deleteItem(this.refId(undefined, item));
  }

  async clear(): Promise<boolean> {
    return this.deleteAllItems();
  }

  protected createIndices(store: IDBObjectStore): void {
    store.createIndex('type', 'type');
    store.createIndex('dbId', 'dbId');
  }
}

async function fetchMediaItemData(item: OfflinedBy): Promise<{
  item: FullPlaylist | FullAlbum;
  tracks: Track[];
}> {
  if (item.model_type === 'playlist') {
    const data = await queryClient.ensureQueryData(
      appQueries.playlists
        .show(item.id)
        .playlist('playlistPage', offlinedMediaItems.MAX_ITEMS),
    );
    return {
      item: data.playlist,
      tracks: data.tracks.data,
    };
  } else {
    const data = await queryClient.ensureQueryData(
      appQueries.albums.get(item.id, 'albumPage'),
    );
    return {
      item: {
        ...data.album,
        tracks: [],
      },
      tracks: data.album.tracks ?? [],
    };
  }
}

export const offlinedMediaItems = new _OfflinedMediaItems();
