<?php

namespace App\Services\Tracks\Queries;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HistoryTrackQuery extends BaseTrackQuery
{
    const ORDER_COL = 'latest_plays.added_at';

    public function get($userId): Builder
    {
        $userId = $userId == 'me' ? Auth::id() : $userId;

        $subquery = DB::table('track_plays')
            ->select('track_id', DB::raw('MAX(created_at) as added_at'))
            ->where('user_id', $userId)
            ->groupBy('track_id')
            ->orderBy('added_at', 'desc')
            ->limit(1000);

        return $this->baseQuery()
            ->joinSub($subquery, 'latest_plays', function ($join) {
                $join->on('tracks.id', '=', 'latest_plays.track_id');
            })
            ->select('tracks.*', 'added_at');
    }

    public function getOrder(): array
    {
        $col = Arr::get($this->params, 'orderBy') ?: static::ORDER_COL;
        if ($col === 'track_plays.created_at') {
            $col = self::ORDER_COL;
        }

        return [
            'col' => $col,
            'dir' => Arr::get($this->params, 'orderDir') ?: static::ORDER_DIR,
        ];
    }

    public function getFrontendOrderKey(): string
    {
        $order = $this->getOrder();
        return match ($order['col']) {
            'latest_plays.created_at', 'latest_plays.added_at' => 'added_at',
            default => $order['col'],
        };
    }
}
