import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient, queryClient} from '@common/http/query-client';
import {FileEntry} from '@common/uploads/file-entry';
import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';

const endpoint = 'backstage-request';

interface Response extends BackendResponse {
  request: BackstageRequest;
}

export interface CreateBackstageRequestPayload {
  type: 'verify-artist' | 'become-artist' | 'claim-artist';
  artist_id?: number | null;
  artist_name: string;
  name: string;
  image?: string | null;
  role: string;
  company: string;
  passportScan?: Omit<FileEntry, 'parent' | 'children'>;
}

export function useCreateBackstageRequest(
  form: UseFormReturn<CreateBackstageRequestPayload>,
) {
  return useMutation({
    mutationFn: (payload: CreateBackstageRequestPayload) =>
      createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey(endpoint),
      });
    },
    onError: err => onFormQueryError(err, form),
  });
}

function createRequest(payload: CreateBackstageRequestPayload) {
  return apiClient
    .post<Response>(endpoint, {
      artist_name: payload.artist_name,
      artist_id: payload.artist_id,
      type: payload.type,
      data: {
        name: payload.name,
        image: payload.image,
        role: payload.role,
        company: payload.company,
        passport_scan_id: payload.passportScan?.id,
      },
    })
    .then(r => r.data);
}
