import {BackendResponse} from '@common/http/backend-response/backend-response';
import {DefaultMetaTags} from '@common/seo/default-meta-tags';
import {Helmet} from '@common/seo/helmet';
import {UseQueryResult, UseSuspenseQueryResult} from '@tanstack/react-query';

interface Props {
  query?:
    | UseQueryResult<BackendResponse>
    | UseSuspenseQueryResult<BackendResponse>;
  data?: BackendResponse;
}
export function PageMetaTags({query, data}: Props) {
  if (!data) {
    data = query?.data;
  }
  if (data?.set_seo) {
    return null;
  }
  return data?.seo ? <Helmet tags={data.seo} /> : <DefaultMetaTags />;
}
