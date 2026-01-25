import {offlinedMediaItems} from '@app/offline/offline-media-items';
import {offlineQueue} from '@app/offline/offline-queue';
import {OfflinedBy, offlinedTracks} from '@app/offline/offlined-tracks';
import {Track} from '@app/web-player/tracks/track';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {create} from 'zustand';

interface OfflineEntitiesState {
  offlineToastVisible: boolean;
  setOfflineToastVisible: (visible: boolean) => void;
  // these are ids of tracks that are fully downloaded already
  offlinedTrackIds: Set<number>;

  // these are ids that are either marked for offlining or are offlined already
  offlinedPlaylistIds: Set<number>;
  offlinedAlbumIds: Set<number>;

  offlineQueue: Set<number>;
  init: () => Promise<void>;
  offlineMediaItem: (item: OfflinedBy) => Promise<void>;
  offlineTracks: (tracks: Track[], offlinedBy?: OfflinedBy) => Promise<void>;
  deleteOfflinedTracks: (
    tracks: {id: number}[],
    offlinedBy?: OfflinedBy,
  ) => Promise<void>;
  deleteOfflinedMediaItem: (item: OfflinedBy) => Promise<void>;
  isTrackOfflined: (trackId: number) => boolean;
}

let storeIsInitialized = false;

export const useOfflineEntitiesStore = create<OfflineEntitiesState>()(
  (set, get) => ({
    offlineToastVisible: false,
    offlinedTrackIds: new Set<number>(),
    offlinedPlaylistIds: new Set<number>(),
    offlinedAlbumIds: new Set<number>(),
    offlineQueue: new Set<number>(),

    init: async () => {
      if (storeIsInitialized) {
        return;
      }

      offlineQueue.listen('onItemUpdated', item => {
        if (!get().offlineQueue.has(item.id)) {
          const newQueue = new Set(get().offlineQueue).add(item.id);
          set({offlineQueue: newQueue});
        }
      });
      offlineQueue.listen('onItemDeleted', item => {
        const newQueue = new Set(get().offlineQueue);
        newQueue.delete(item.id);
        set({
          offlineQueue: newQueue,
          offlineToastVisible:
            newQueue.size === 0 ? false : get().offlineToastVisible,
        });
      });

      offlinedTracks.listen('onItemUpdated', item => {
        if (!get().offlinedTrackIds.has(item.id) && item.isDownloaded) {
          const newOfflinedTrackIds = new Set(get().offlinedTrackIds);
          newOfflinedTrackIds.add(item.id);
          set({offlinedTrackIds: newOfflinedTrackIds});
        }
      });
      offlinedTracks.listen('onItemDeleted', item => {
        if (get().offlinedTrackIds.has(item.id)) {
          const newOfflinedTrackIds = new Set(get().offlinedTrackIds);
          newOfflinedTrackIds.delete(item.id);
          set({offlinedTrackIds: newOfflinedTrackIds});
        }
      });

      offlinedMediaItems.listen('onItemUpdated', item => {
        if (item.type === 'playlist') {
          if (!get().offlinedPlaylistIds.has(item.id)) {
            const newOfflinedPlaylistIds = new Set(get().offlinedPlaylistIds);
            newOfflinedPlaylistIds.add(item.id);
            set({offlinedPlaylistIds: newOfflinedPlaylistIds});
          }
        } else {
          if (!get().offlinedAlbumIds.has(item.id)) {
            const newOfflinedAlbumIds = new Set(get().offlinedAlbumIds);
            newOfflinedAlbumIds.add(item.id);
            set({offlinedAlbumIds: newOfflinedAlbumIds});
          }
        }
      });
      offlinedMediaItems.listen('onItemDeleted', item => {
        if (item.type === 'playlist') {
          if (get().offlinedPlaylistIds.has(item.id)) {
            const newOfflinedPlaylistIds = new Set(get().offlinedPlaylistIds);
            newOfflinedPlaylistIds.delete(item.id);
            set({offlinedPlaylistIds: newOfflinedPlaylistIds});
          }
        } else {
          if (get().offlinedAlbumIds.has(item.id)) {
            const newOfflinedAlbumIds = new Set(get().offlinedAlbumIds);
            newOfflinedAlbumIds.delete(item.id);
            set({offlinedAlbumIds: newOfflinedAlbumIds});
          }
        }
      });

      try {
        const offlinedTrackIds = await offlinedTracks.getAllTrackIds({
          downloadedOnly: true,
        });

        const offlinedPlaylistIds =
          await offlinedMediaItems.getAllPlaylistIds();
        const offlinedAlbumIds = await offlinedMediaItems.getAllAlbumIds();

        const queuedItems = await offlineQueue.getQueuedTracks();

        offlineQueue.runQueue();

        set({
          offlinedTrackIds: new Set(offlinedTrackIds),
          offlinedPlaylistIds: new Set(offlinedPlaylistIds),
          offlinedAlbumIds: new Set(offlinedAlbumIds),
          offlineToastVisible: queuedItems.length > 0,
          offlineQueue: new Set(queuedItems.map(item => item.id)),
        });
      } catch (error) {
        //
      }

      storeIsInitialized = true;
    },

    setOfflineToastVisible: visible => {
      set({offlineToastVisible: visible});
    },

    offlineMediaItem: async item => {
      offlinedMediaItems.addItem(item);
      set({offlineToastVisible: true});
    },

    deleteOfflinedMediaItem: async item => {
      await offlinedMediaItems.delete(item);
      const queuedItems = await offlineQueue.getQueuedTracks();
      if (!queuedItems.length) {
        set({offlineToastVisible: false});
      }
    },

    offlineTracks: async (tracks, offlinedBy) => {
      offlineQueue.addTracks(tracks, offlinedBy);
      set({offlineToastVisible: true});
    },

    deleteOfflinedTracks: async (tracks, offlinedBy) => {
      for (const track of tracks) {
        offlinedTracks.deleteTrack(track.id, offlinedBy).catch();
      }
      const queuedItems = await offlineQueue.getQueuedTracks();
      if (!queuedItems.length) {
        set({offlineToastVisible: false});
      }
    },

    isTrackOfflined: (trackId: number) => {
      return get().offlinedTrackIds.has(trackId);
    },
  }),
);

export const offlinedEntitiesStore = useOfflineEntitiesStore.getState;

// initialize store only if offlining is enabled
if (getBootstrapData().settings.player?.enable_offlining) {
  useOfflineEntitiesStore.getState().init();
}
