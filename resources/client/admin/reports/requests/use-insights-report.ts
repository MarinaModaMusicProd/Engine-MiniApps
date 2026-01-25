import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {Track} from '@app/web-player/tracks/track';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {
  DatasetItem,
  LocationDatasetItem,
  ReportMetric,
} from '@common/admin/analytics/report-metric';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';

const endpoint = 'reports/insights';

export interface TopModelDatasetItem extends DatasetItem {
  model: PartialArtist | PartialAlbum | Track | PartialUserProfile;
}

export interface FetchInsightsReportResponse extends BackendResponse {
  report: {
    totalClicks: number;
    plays: ReportMetric;
    browsers: ReportMetric;
    locations: ReportMetric<LocationDatasetItem>;
    devices: ReportMetric;
    platforms: ReportMetric;
    tracks: ReportMetric<TopModelDatasetItem>;
    artists: ReportMetric<TopModelDatasetItem>;
    albums: ReportMetric<TopModelDatasetItem>;
    users: ReportMetric<TopModelDatasetItem>;
  };
}

export type InsightsReportMetric =
  | 'plays'
  | 'devices'
  | 'browsers'
  | 'platforms'
  | 'locations'
  | 'tracks'
  | 'artists'
  | 'albums'
  | 'users';

interface Payload {
  dateRange: DateRangeValue;
  model?: string;
  metrics?: InsightsReportMetric[];
}

interface Options {
  isEnabled: boolean;
}

export function useInsightsReport(payload: Payload, options: Options) {
  return useQuery({
    queryKey: [endpoint, payload],
    queryFn: () => fetchReport(endpoint, payload),
    placeholderData: options.isEnabled ? keepPreviousData : undefined,
    enabled: options.isEnabled,
  });
}

function fetchReport<
  T extends FetchInsightsReportResponse = FetchInsightsReportResponse,
>(endpoint: string, payload: Payload): Promise<T> {
  const params: Record<string, any> = {
    model: payload.model,
    metrics: payload.metrics?.join(','),
  };
  params.startDate = payload.dateRange.start.toAbsoluteString();
  params.endDate = payload.dateRange.end.toAbsoluteString();
  params.timezone = payload.dateRange.start.timeZone;

  return apiClient.get(endpoint, {params}).then(response => response.data);
}
