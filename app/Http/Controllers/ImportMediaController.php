<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Genre;
use App\Models\Playlist;
use App\Models\Track;
use App\Services\Lyrics\ImportLyrics;
use App\Services\Providers\DataObjects\FetchArtistOptions;
use App\Services\Providers\MusicMetadataProvider;
use Common\Core\BaseController;
use Illuminate\Http\Request;

class ImportMediaController extends BaseController
{
    public function __construct(protected Request $request) {}

    public function import()
    {
        $modelType = request('modelType');
        $externalId =
            request('metadataProvider') === 'spotify'
                ? request('spotifyId')
                : request('deezerId');

        $namespace = modelTypeToNamespace(request('modelType'));
        $this->authorize('store', $namespace);

        $this->validate($this->request, [
            'modelType' => 'required|string',
        ]);

        switch ($modelType) {
            case Artist::MODEL_TYPE:
                $artist = (new MusicMetadataProvider(
                    request('metadataProvider'),
                ))->importArtist(
                    $externalId,
                    new FetchArtistOptions(
                        importSimilarArtists: request('importSimilarArtists'),
                        importAlbums: request('importAlbums'),
                    ),
                );
                if ($artist) {
                    return $this->success(['artist' => $artist]);
                } else {
                    return $this->error('Could not import artist');
                }
            case Album::MODEL_TYPE:
                $album = (new MusicMetadataProvider(
                    request('metadataProvider'),
                ))->importAlbum($externalId);
                if ($album) {
                    return $this->success(['album' => $album]);
                } else {
                    return $this->error('Could not import album');
                }
            case Track::MODEL_TYPE:
                $track = (new MusicMetadataProvider(
                    request('metadataProvider'),
                ))->importTrack($externalId);
                if ($track) {
                    if (request('importLyrics')) {
                        (new ImportLyrics())->execute($track->id);
                    }
                    return $this->success(['track' => $track]);
                } else {
                    return $this->error('Could not import track');
                }
            case Playlist::MODEL_TYPE:
                $playlist = (new MusicMetadataProvider(
                    request('metadataProvider'),
                ))->importPlaylist($externalId, createLocalPlaylist: true);
                if ($playlist) {
                    return $this->success(['playlist' => $playlist]);
                } else {
                    return $this->error('Could not import track');
                }
            case Genre::MODEL_TYPE:
                $genre = Genre::find($this->request->get('genreId'));
                $data = (new MusicMetadataProvider(
                    request('metadataProvider'),
                ))->importGenre($genre, $genre->name);

                if ($data) {
                    return $this->success([
                        'genre' => $genre,
                        'data' => $data,
                    ]);
                } else {
                    return $this->error('Could not import genre');
                }
        }

        return $this->error('Invalid model type');
    }
}
