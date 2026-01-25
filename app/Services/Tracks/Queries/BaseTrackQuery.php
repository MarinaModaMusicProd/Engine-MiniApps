<?php

namespace App\Services\Tracks\Queries;

use App\Models\Track;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;

abstract class BaseTrackQuery
{
    const ORDER_DIR = 'desc';

    public function __construct(protected array $params) {}

    abstract public function get(int $modelId): Builder;

    protected function baseQuery(): Builder
    {
        $order = $this->getOrder();

        return Track::query()
            ->with(['artists', 'uploadedSrc', 'album.artists'])
            ->orderBy($order['col'], $order['dir'])
            ->when(
                $order['col'] !== 'latest_plays.id',
                fn(Builder $query) => $query->orderBy('tracks.id', 'desc'),
            );
    }

    public function getOrder(): array
    {
        $order = [
            'col' => Arr::get($this->params, 'orderBy') ?: static::ORDER_COL,
            'dir' => Arr::get($this->params, 'orderDir') ?: static::ORDER_DIR,
        ];

        if ($order['col'] === 'popularity') {
            $order['col'] =
                settings('player.sort_method', 'external') === 'external'
                    ? 'spotify_popularity'
                    : 'plays';
        }

        return $order;
    }
}
