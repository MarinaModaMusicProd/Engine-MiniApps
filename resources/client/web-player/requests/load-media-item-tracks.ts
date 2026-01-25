import {offlinedEntitiesStore} from '@app/offline/offline-entities-store';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {splitQueueGroupId} from '@app/web-player/queue-group-id';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {onlineManager} from '@tanstack/react-query';

interface Response extends BackendResponse {
  tracks: Track[];
}

export async function loadMediaItemTracks(
  queueId: string,
  lastTrack?: Track | null,
  perPage: number = 30,
): Promise<Response['tracks']> {
  if (!onlineManager.isOnline()) {
    const {modelType, modelId} = splitQueueGroupId(queueId);
    if (
      modelId &&
      ((modelType === 'album' &&
        offlinedEntitiesStore().offlinedAlbumIds.has(modelId)) ||
        (modelType === 'playlist' &&
          offlinedEntitiesStore().offlinedPlaylistIds.has(modelId)))
    ) {
      return (
        await offlinedTracks.getTracksOfflinedBy({
          id: modelId,
          model_type: modelType,
        })
      ).map(track => track.data);
    }
  }

  const query = {
    queryKey: ['player/tracks', {queueId, trackId: lastTrack?.id, perPage}],
    queryFn: async () =>
      apiClient
        .post('player/tracks', {queueId, lastTrack, perPage})
        .then(r => r.data),
    staleTime: Infinity,
  };

  try {
    const response =
      queryClient.getQueryData<Response>(query.queryKey) ??
      (await queryClient.fetchQuery(query));
    return response?.tracks || [];
  } catch (e) {
    return [];
  }
}
