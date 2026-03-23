import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useMutation} from '@tanstack/react-query';
import {
  getBootstrapData,
  mergeBootstrapData,
} from '@ui/bootstrap-data/bootstrap-data-store';
import {Localization} from '@ui/i18n/localization';

interface ChangeLocaleResponse extends BackendResponse {
  locale: Localization;
}

export function useChangeLocale() {
  return useMutation({
    mutationFn: (props: {locale?: string}) =>
      apiClient
        .post<ChangeLocaleResponse>(`users/me/locale`, props)
        .then(r => r.data),
    onSuccess: response => {
      const mergedLocales = getBootstrapData().i18n.locales.map(locale => {
        if (locale.language === response.locale.language) {
          return {
            ...locale,
            lines: response.locale.lines ?? {},
          };
        }
        return locale;
      });
      mergeBootstrapData({
        i18n: {
          locales: mergedLocales,
          active: response.locale.language,
          direction: response.locale.direction,
        },
      });

      document.documentElement.dir = response.locale.direction;
      document.documentElement.lang = response.locale.language;
    },
    onError: err => showHttpErrorToast(err),
  });
}
