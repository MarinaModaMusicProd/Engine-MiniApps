<?php

namespace App\Services\Channels;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Track;
use App\Services\Tracks\Queries\PlaylistTrackQuery;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FetchContentForChannelFromLocal
{
    public function execute(
        string $method,
        mixed $value,
        ?array $filters = [],
    ): Collection|null {
        return match ($method) {
            'topTracks' => $this->topTracks($filters),
            'newAlbums' => $this->albums($filters, orderBy: 'release_date'),
            'topAlbums' => $this->albums($filters, orderBy: 'popularity'),
            'topArtists' => $this->topArtists($filters),
            'playlistTracks' => $this->playlistTracks($value),
            'topGenres' => Genre::orderBy('popularity', 'desc')
                ->limit(20)
                ->get(),
            'nonEmptyGenres' => $this->nonEmptyGenres(),
            default => null,
        };
    }

    protected function topTracks(?array $filters = [])
    {
        if (isset($filters['genre'])) {
            $genre = Genre::find($filters['genre']);
            return $genre
                ? $genre
                    ->tracks()
                    ->orderByPopularity()
                    ->limit(20)
                    ->get()
                : collect();
        }

        return Track::orderByPopularity()
            ->limit(20)
            ->get();
    }

    protected function albums(
        ?array $filters = [],
        string $orderBy = 'release_date',
    ) {
        if (isset($filters['genre'])) {
            $genre = Genre::find($filters['genre']);
            return $genre
                ? $genre
                    ->albums()
                    ->when(
                        $orderBy === 'popularity',
                        fn($query) => $query->orderByPopularity(),
                        fn($query) => $query->orderBy($orderBy, 'desc'),
                    )
                    ->limit(20)
                    ->get()
                : collect();
        }

        return Album::when(
            $orderBy === 'popularity',
            fn($query) => $query->orderByPopularity(),
            fn($query) => $query->orderBy($orderBy, 'desc'),
        )
            ->limit(20)
            ->get();
    }

    protected function topArtists(?array $filters = [])
    {
        if (isset($filters['genre'])) {
            $genre = Genre::find($filters['genre']);
            return $genre
                ? $genre
                    ->artists()
                    ->orderByPopularity()
                    ->limit(20)
                    ->get()
                : collect();
        }

        return Artist::query()
            ->orderByPopularity()
            ->limit(20)
            ->get();
    }

    protected function playlistTracks(int $id)
    {
        $query = (new PlaylistTrackQuery([
            'orderBy' => 'position',
            'orderDir' => 'asc',
        ]))->get($id);

        return $query->limit(20)->get();
    }

    protected function nonEmptyGenres()
    {
        // get genres that has at least one record attached in genreables table, order by number of attachments in genreables table
        return Genre::select('genres.*')
            ->join('genreables', 'genres.id', '=', 'genreables.genre_id')
            ->groupBy('genres.id')
            ->orderBy(DB::raw('COUNT(genreables.genre_id)'), 'desc')
            ->orderBy('popularity', 'desc')
            ->limit(20)
            ->get();
    }
}
