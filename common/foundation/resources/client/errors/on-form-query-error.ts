import axios from 'axios';
import {UseFormReturn} from 'react-hook-form';
import {BackendErrorResponse} from './backend-error-response';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';

export function onFormQueryError(r: unknown, form: UseFormReturn<any>) {
  if (form && axios.isAxiosError(r) && r.response) {
    const response = r.response.data as BackendErrorResponse;
    if (errorsAreEmpty(response.errors)) {
      showHttpErrorToast(r);
    } else {
      Object.entries(response.errors || {}).forEach(([key, errors], index) => {
        if (typeof errors === 'string') {
          form.setError(key, {message: errors}, {shouldFocus: index === 0});
        } else {
          errors.forEach((message, subIndex) => {
            form.setError(
              key,
              {message},
              {shouldFocus: index === 0 && subIndex === 0},
            );
          });
        }
      });
    }
  }
}

function errorsAreEmpty(errors: any): boolean {
  return (
    !errors ||
    (Array.isArray(errors) && errors.length === 0) ||
    Object.keys(errors).length === 0
  );
}
