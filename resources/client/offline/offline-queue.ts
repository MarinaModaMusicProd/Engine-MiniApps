import {BaseOfflineDb, ListenCallbacks} from '@app/offline/base-offline-db';
import {OfflinedBy, offlinedTracks} from '@app/offline/offlined-tracks';
import {Track} from '@app/web-player/tracks/track';

export type OfflineQueueItem = {
  id: number;
  track: Track;
  offlinedBy: string[];
};

type QueueListenCallbacks = ListenCallbacks<OfflineQueueItem> & {
  onActiveDownloadsChanged: (activeDownloads: Map<number, number>) => void;
};

class _OfflineQueue extends BaseOfflineDb<
  OfflineQueueItem,
  QueueListenCallbacks
> {
  protected maxConcurrentDownloads = 3;
  protected dbName = 'offline_queue';
  protected dbVersion = 1;
  protected dbStoreName = 'queue';

  protected activeDownloads = new ActiveDownloads(e => {
    const downloadListeners =
      (this.listeners.get('onActiveDownloadsChanged') as
        | QueueListenCallbacks['onActiveDownloadsChanged'][]
        | undefined) ?? [];
    downloadListeners.forEach(l => l(e));
  });

  async addTracks(tracks: Track[], offlinedBy?: OfflinedBy) {
    const promises = tracks.map(track =>
      this.pushTrackToQueue(track, offlinedBy),
    );
    await Promise.allSettled(promises);
    this.runQueue();
  }

  async deleteTrack(trackId: number) {
    await this.deleteItem(trackId);
    this.activeDownloads.delete(trackId);
    this.runQueue();
  }

  async deleteTracksQueuedBy(offlinedBy: OfflinedBy) {
    const refId = this.refId(undefined, offlinedBy);
    const tracks = await this.getAllItems('offlinedBy', refId);
    for (const track of tracks) {
      if (track.offlinedBy.length === 1 && track.offlinedBy[0] === refId) {
        this.deleteTrack(track.id);
      } else {
        const newRefs = track.offlinedBy.filter(ref => ref !== refId);
        this.putItem({
          ...track,
          offlinedBy: newRefs,
        });
      }
    }
  }

  async runQueue() {
    const queue = await this.getAllItems();
    const availableDownloadSlots =
      this.maxConcurrentDownloads - this.activeDownloads.size;

    for (let i = 0; i < availableDownloadSlots; i++) {
      const next = queue.find(item => !this.activeDownloads.has(item.id));
      if (!next) break;

      const abortController = new AbortController();
      this.activeDownloads.add(next.id, abortController);
      offlinedTracks
        .makeTrackAvailableOffline(
          next,
          abortController.signal,
          ({percentage}) => {
            this.activeDownloads.update(next.track.id, percentage ?? 0);
          },
        )
        .catch(error => {
          console.error('offlineTrack', error);
        })
        .finally(() => {
          this.deleteItem(next.id);
          this.activeDownloads.delete(next.id);
          this.runQueue();
        });
    }
  }

  async getQueuedTracks(): Promise<OfflineQueueItem[]> {
    return await this.getAllItems();
  }

  async getTracksQueuedBy(offlinedBy: OfflinedBy): Promise<OfflineQueueItem[]> {
    return await this.getAllItems(
      'offlinedBy',
      this.refId(undefined, offlinedBy),
    );
  }

  getDownloadProgress() {
    return this.activeDownloads.getDownloadProgress();
  }

  protected async pushTrackToQueue(
    track: Track,
    offlinedBy?: OfflinedBy,
  ): Promise<boolean> {
    const existingItem = await this.getItem(track.id);
    const oldRefs = existingItem?.offlinedBy || [];
    const refId = this.refId(track, offlinedBy);

    if (existingItem && oldRefs.includes(refId)) {
      return true;
    }

    const newRefs = [...oldRefs];
    newRefs.push(refId);

    const item: OfflineQueueItem = {
      id: track.id,
      track,
      offlinedBy: newRefs,
    };

    try {
      return await this.putItem(item);
    } catch (error) {
      return false;
    }
  }

  protected createIndices(store: IDBObjectStore): void {
    store.createIndex('offlinedBy', 'offlinedBy', {multiEntry: true});
  }
}

class ActiveDownloads {
  protected value: Map<
    number,
    {
      percentage: number;
      abortController: AbortController;
    }
  > = new Map();

  get size() {
    return this.value.size;
  }

  constructor(
    protected onChange: (activeDownloads: Map<number, number>) => void,
  ) {}

  add(trackId: number, abortController: AbortController) {
    this.value.set(trackId, {
      percentage: 0,
      abortController,
    });
    this.onChange(this.getDownloadProgress());
  }

  update(trackId: number, percentage: number) {
    const oldValue = this.value.get(trackId);
    const newPercentage = Math.trunc(percentage);
    if (oldValue && oldValue.percentage !== newPercentage) {
      this.value.set(trackId, {
        ...oldValue,
        percentage: newPercentage,
      });
      this.onChange(this.getDownloadProgress());
    }
  }

  delete(trackId: number) {
    const oldValue = this.value.get(trackId);
    if (oldValue) {
      oldValue.abortController.abort('Cancelled by user');
      this.value.delete(trackId);
      this.onChange(this.getDownloadProgress());
    }
  }

  has(trackId: number) {
    return this.value.has(trackId);
  }

  getDownloadProgress(): Map<number, number> {
    return new Map(
      [...this.value.entries()].map(([key, value]) => [key, value.percentage]),
    );
  }
}

export const offlineQueue = new _OfflineQueue();
