import {BaseOfflineDb} from '@app/offline/base-offline-db';
import type {OfflineQueueItem} from '@app/offline/offline-queue';
import {
  deleteTrackPlaybackData,
  downloadAndStoreTrackPlaybackData,
  ProgressCallback,
} from '@app/offline/playback-data-storage';
import {Track} from '@app/web-player/tracks/track';

export type OfflinedTrack = {
  id: Track['id'];
  isDownloaded: 0 | 1;
  data: Track;
  offlinedBy: string[];
};

export type OfflinedBy = {id: number; model_type: 'album' | 'playlist'};

const activeDownloads = new Map<Track['id'], Promise<boolean>>();

class _OfflinedTracks extends BaseOfflineDb<OfflinedTrack> {
  protected dbName = 'offlined_tracks';
  protected dbVersion = 1;
  protected dbStoreName = 'tracks';

  async makeTrackAvailableOffline(
    queueItem: OfflineQueueItem,
    abortSignal: AbortSignal,
    onProgress: ProgressCallback,
  ): Promise<boolean> {
    const existingTrack = await this.getItem(queueItem.track.id);
    if (existingTrack) {
      if (existingTrack.isDownloaded) {
        // update "offlinedBy" if track was already offlined by another entity
        const newRefs = [...existingTrack.offlinedBy];
        queueItem.offlinedBy.forEach(ref => {
          if (!newRefs.includes(ref)) {
            newRefs.push(ref);
          }
        });
        this.putItem({
          ...existingTrack,
          offlinedBy: newRefs,
        });

        return true;
      } else if (activeDownloads.has(queueItem.track.id)) {
        return activeDownloads.get(queueItem.track.id)!;
      }
    }

    const offlinedTrack: OfflinedTrack = {
      id: queueItem.track.id,
      isDownloaded: 0,
      data: queueItem.track,
      offlinedBy: queueItem.offlinedBy,
    };
    const trackMetaStored = await this.putItem(offlinedTrack);

    try {
      if (trackMetaStored) {
        if (
          await downloadAndStoreTrackPlaybackData(
            queueItem.track,
            abortSignal,
            onProgress,
          )
        ) {
          await this.putItem({
            ...offlinedTrack,
            isDownloaded: 1,
          });
          return true;
        }
      }
    } catch (error) {
      // don't log if fetch request was cancelled by the user
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false;
      }

      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        throw error;
      }

      console.error('makeTrackAvailableOffline', error);
    }

    return false;
  }

  async getAllTrackIds({
    downloadedOnly,
    pendingOnly,
  }: {
    downloadedOnly?: boolean;
    pendingOnly?: boolean;
  } = {}): Promise<number[]> {
    if (downloadedOnly) {
      return this.getAllKeys<number>('isDownloaded', 1);
    } else if (pendingOnly) {
      return this.getAllKeys<number>('isDownloaded', 0);
    } else {
      return this.getAllKeys<number>();
    }
  }

  async getAllDownloadedTracks(): Promise<OfflinedTrack[]> {
    return this.getAllItems('isDownloaded', 1);
  }

  async deleteTrack(
    trackId: number,
    offlinedBy?: {id: number; model_type: 'album' | 'playlist'},
  ): Promise<boolean> {
    const refId = this.refId({id: trackId}, offlinedBy);
    const existingTrack = await this.getItem(trackId);

    if (!existingTrack) {
      return true;
    }

    // if track is offlined by multiple entities, remove the reference
    // to that entity only, otherwise delete the track and playback data
    const newRefs = existingTrack.offlinedBy.filter(ref => ref !== refId);
    if (newRefs.length === 0) {
      deleteTrackPlaybackData(trackId);
      return this.deleteItem(trackId);
    } else {
      return this.putItem({
        ...existingTrack,
        offlinedBy: newRefs,
      });
    }
  }

  async deleteTracksOfflinedBy(item: OfflinedBy): Promise<boolean> {
    const tracks = await this.getTracksOfflinedBy(item);
    for (const track of tracks) {
      await this.deleteTrack(track.id, item);
    }
    return true;
  }

  async clear(): Promise<boolean> {
    return this.deleteAllItems();
  }

  async get(trackId: number): Promise<OfflinedTrack | null> {
    return this.getItem(trackId);
  }

  async getTracksOfflinedBy(item: OfflinedBy): Promise<OfflinedTrack[]> {
    return await this.getAllItems('offlinedBy', this.refId(undefined, item));
  }

  protected createIndices(store: IDBObjectStore): void {
    store.createIndex('isDownloaded', 'isDownloaded', {
      unique: false,
    });

    store.createIndex('offlinedBy', 'offlinedBy', {multiEntry: true});
  }
}

export const offlinedTracks = new _OfflinedTracks();
