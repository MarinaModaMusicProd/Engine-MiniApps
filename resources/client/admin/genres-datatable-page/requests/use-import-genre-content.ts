import {appQueries} from '@app/app-queries';
import {Genre, GENRE_MODEL} from '@app/web-player/genres/genre';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {toast} from '@ui/toast/toast';

interface Payload {
  genre: Genre;
}

export function useImportGenreContent() {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: Payload) =>
      apiClient
        .post('import-media/single-item', {
          modelType: GENRE_MODEL,
          genreId: props.genre.id,
        })
        .then(r => r.data),
    onSuccess: () => {
      toast(trans(message('Content imported')));
      queryClient.invalidateQueries({
        queryKey: appQueries.genres.invalidateKey,
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}
