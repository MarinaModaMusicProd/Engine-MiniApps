<?php

namespace App\Services\Artists;

use App\Models\Artist;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GetSimilarArtists
{
    public function execute(Artist $artist, array $params = []): Collection
    {
        $genreIds = $artist->genres->pluck('id');

        if ($genreIds->isNotEmpty()) {
            return $this->getByGenres($genreIds, $artist->id, $params);
        }

        return collect();
    }

    private function getByGenres(
        Collection $genreIds,
        $artistId,
        $params,
    ): Collection {
        $subquery = DB::table('genreables')
            ->select('genreable_id', DB::raw('count(*) as tag_count'))
            ->whereIn('genre_id', $genreIds)
            ->where('genreable_type', 'artist')
            ->where('genreable_id', '!=', $artistId)
            ->groupBy('genreable_id')
            ->orderBy('tag_count', 'desc')
            ->limit(Arr::get($params, 'limit', 10));

        return Artist::joinSub($subquery, 'top_artists', function ($join) {
            $join->on('artists.id', '=', 'top_artists.genreable_id');
        })
            ->orderBy('top_artists.tag_count', 'desc')
            ->select('artists.*', 'top_artists.tag_count')
            ->get();
    }
}
