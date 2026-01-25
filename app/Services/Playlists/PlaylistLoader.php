<?php

namespace App\Services\Playlists;

use App\Models\Playlist;
use App\Models\User;
use App\Services\Tracks\PaginateTracks;
use App\Services\Tracks\Queries\PlaylistTrackQuery;

class PlaylistLoader
{
    public function load(Playlist $playlist, string $loader): array
    {
        $response = [
            'playlist' => $playlist,
            'loader' => $loader,
        ];

        if ($loader === 'playlistPage' || $loader === 'editPlaylistPage') {
            $playlist->load('editors')->loadCount('tracks');
            $response['tracks'] = $this->paginateTracks($playlist->id, $loader);
        }

        if ($loader === 'playlistPage') {
            $response['totalDuration'] = (int) $playlist
                ->tracks()
                ->sum('tracks.duration');
        }

        $response['playlist'] = $this->toApiResource(
            $playlist,
            $loader,
            $response['tracks']['data'],
        );

        return $response;
    }

    public function toApiResource(
        Playlist $playlist,
        string|null $loader = null,
        array|null $tracks = null,
    ): array {
        $resource = [
            'id' => $playlist->id,
            'name' => $playlist->name,
            'public' => $playlist->public,
            'collaborative' => $playlist->collaborative,
            'image' => $playlist->image,
            'views' => $playlist->views,
            'owner_id' => $playlist->owner_id,
            'model_type' => $playlist->model_type,
        ];

        if (!$resource['image'] && $tracks) {
            $resource['image'] = $tracks[0]['image'] ?? null;
        }

        if (
            $loader === 'playlistPage' ||
            $loader === 'editPlaylistPage' ||
            $loader === 'editPlaylistDatatable'
        ) {
            $resource['description'] = $playlist->description;
            $resource['updated_at'] = $playlist->updated_at?->toJSON();
        }

        if ($playlist->relationLoaded('editors')) {
            $resource['editors'] = $playlist->editors->isEmpty()
                ? [
                    [
                        'id' => 0,
                        'name' => 'Unknown',
                        'image' => null,
                    ],
                ]
                : $playlist->editors->map(
                    fn(User $editor) => [
                        'id' => $editor->id,
                        'name' => $editor->name,
                        'image' => $editor->image,
                    ],
                );
        }

        if ($playlist->tracks_count !== null) {
            $resource['tracks_count'] = $playlist->tracks_count;
        }

        return $resource;
    }

    public function paginateTracks(int $playlistId, string|null $loader = null)
    {
        $params = [
            'orderBy' => request()->get('orderBy', 'position'),
            'orderDir' => request()->get('orderDir', 'asc'),
            'perPage' => request('perPage', 30),
            'paginate' => request('paginate', 'simple'),
        ];

        $builder = (new PlaylistTrackQuery([
            'orderBy' => $params['orderBy'],
            'orderDir' => $params['orderDir'],
        ]))->get($playlistId);

        return (new PaginateTracks())->asApiResponse(
            $params,
            $builder,
            loader: $loader,
            hasCustomOrder: true,
        );
    }
}
