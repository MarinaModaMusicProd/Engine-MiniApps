import {
  CreateTrackPayload,
  prepareTrackPayload,
} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {FullAlbum, PartialAlbum} from '@app/web-player/albums/album';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';
import {NormalizedModel} from '@ui/types/normalized-model';
import {UseFormReturn} from 'react-hook-form';

const endpoint = 'albums';

interface Response extends BackendResponse {
  album: FullAlbum;
}

export type CreateAlbumPayloadTrack = Omit<
  CreateTrackPayload,
  'album' | 'artists' | 'lyric'
> & {
  uploadId: string;
};

export interface CreateAlbumPayload extends Omit<
  PartialAlbum,
  'genres' | 'tags' | 'tracks' | 'artists'
> {
  description?: string | null;
  spotify_id?: string | null;
  artists: NormalizedModel[];
  genres?: NormalizedModel[] | string[];
  tags?: NormalizedModel[];
  tracks: CreateAlbumPayloadTrack[];
}

export function useCreateAlbum(form: UseFormReturn<CreateAlbumPayload>) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: CreateAlbumPayload) => createAlbum(payload),
    onSuccess: () => {
      toast(trans(message('Album created')));
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createAlbum(payload: CreateAlbumPayload) {
  return apiClient
    .post<Response>(endpoint, prepareAlbumPayload(payload))
    .then(r => r.data);
}

export function prepareAlbumPayload(payload: CreateAlbumPayload) {
  return {
    ...payload,
    artists: payload.artists?.map(artist => artist.id),
    tracks: payload.tracks?.map(track => prepareTrackPayload(track)),
  };
}
