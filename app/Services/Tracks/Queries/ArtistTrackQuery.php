<?php

namespace App\Services\Tracks\Queries;

use App\Models\Artist;
use App\Services\Providers\MusicMetadataProvider;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class ArtistTrackQuery extends BaseTrackQuery
{
    const ORDER_COL = 'popularity';

    public function get(int $artistId): Builder
    {
        $artist = Artist::find($artistId);

        if ($artist && $artist->needsUpdating()) {
            (new MusicMetadataProvider())->importArtist($artist);
        }

        return $this->baseQuery()
            ->join('artist_track', 'tracks.id', '=', 'artist_track.track_id')
            ->where('artist_track.artist_id', $artistId)
            ->select('tracks.*');
    }

    public function getOrder(): array
    {
        $orderBy = Arr::get($this->params, 'orderBy', static::ORDER_COL);
        $orderDir = Arr::get($this->params, 'orderDir', static::ORDER_DIR);

        if ($orderBy === 'popularity') {
            $orderBy =
                settings('player.sort_method', 'external') === 'external'
                    ? 'external_popularity'
                    : 'plays';
        }

        return [
            'col' => $orderBy,
            'dir' => $orderDir,
        ];
    }

    public function getFrontendOrderKey(): string
    {
        $order = $this->getOrder();
        return match ($order['col']) {
            'external_popularity' => 'popularity',
            default => $order['col'],
        };
    }
}
