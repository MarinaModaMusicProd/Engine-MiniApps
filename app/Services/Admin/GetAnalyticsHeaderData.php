<?php

namespace App\Services\Admin;

use App\Models\Artist;
use App\Models\Like;
use App\Models\Track;
use App\Models\User;
use Common\Admin\Analytics\Actions\GetAnalyticsHeaderDataAction;
use Common\Database\Metrics\MetricDateRange;
use Common\Database\Metrics\ValueMetric;

class GetAnalyticsHeaderData implements GetAnalyticsHeaderDataAction
{
    public function execute(array $params): array
    {
        $dateRange = new MetricDateRange(
            start: $params['startDate'] ?? null,
            end: $params['endDate'] ?? null,
            timezone: $params['timezone'] ?? null,
        );

        return [
            array_merge(
                [
                    'name' => __('New users'),
                ],
                (new ValueMetric(
                    User::query(),
                    dateRange: $dateRange,
                ))->count(),
            ),

            array_merge(
                [
                    'name' => __('New songs'),
                ],
                (new ValueMetric(
                    Track::query(),
                    dateRange: $dateRange,
                ))->count(),
            ),

            array_merge(
                [
                    'name' => __('New artists'),
                ],
                (new ValueMetric(
                    Artist::query(),
                    dateRange: $dateRange,
                ))->count(),
            ),
            array_merge(
                [
                    'name' => __('Likes'),
                ],
                (new ValueMetric(
                    Like::query(),
                    dateRange: $dateRange,
                ))->count(),
            ),
        ];
    }
}
