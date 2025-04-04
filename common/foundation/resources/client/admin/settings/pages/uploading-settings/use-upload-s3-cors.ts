import {useMutation} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {useTrans} from '@ui/i18n/use-trans';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';

interface Response extends BackendResponse {}

export function useUploadS3Cors() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: () => uploadCors(),
    onSuccess: () => {
      toast(trans(message('CORS file updated')));
    },
    onError: err => showHttpErrorToast(err),
  });
}

function uploadCors(): Promise<Response> {
  return apiClient.post('s3/cors/upload').then(r => r.data);
}
