<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Models\BackstageRequest;
use App\Models\ProfileImage;
use App\Models\ProfileDetails;
use App\Services\Albums\DeleteAlbums;
use App\Services\Tracks\DeleteTracks;
use Common\Files\Actions\Deletion\DeleteEntries;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DeleteArtists
{
    public function execute(Collection $artists): void
    {
        $artistIds = $artists->pluck('id');

        // remove locally uploaded images
        $artists->load(['uploadedImage', 'uploadedProfileImages']);
        $uploadedImageEntries = $artists
            ->pluck('uploadedImage')
            ->flatten(1)
            ->merge($artists->pluck('uploadedProfileImages')->flatten(1));

        if ($uploadedImageEntries->isNotEmpty()) {
            (new DeleteEntries())->execute([
                'entryIds' => $uploadedImageEntries->pluck('id')->toArray(),
            ]);
        }

        // detach similar artists
        DB::table('similar_artists')
            ->whereIn('artist_id', $artistIds)
            ->orWhereIn('similar_id', $artistIds)
            ->delete();

        // detach users
        DB::table('user_artist')->whereIn('artist_id', $artistIds)->delete();
        ProfileDetails::whereIn('artist_id', $artistIds)->delete();

        // detach likes
        DB::table('likes')
            ->where('likeable_type', Artist::MODEL_TYPE)
            ->whereIn('likeable_id', $artistIds)
            ->delete();

        // delete profile images
        ProfileImage::whereIn('artist_id', $artistIds)->delete();

        // delete backstage requests
        BackstageRequest::whereIn('artist_id', $artistIds)->delete();

        // detach genres
        DB::table('genreables')
            ->where('genreable_type', Artist::MODEL_TYPE)
            ->whereIn('genreable_id', $artistIds)
            ->delete();

        // detach channels
        DB::table('channelables')
            ->where('channelable_type', Artist::MODEL_TYPE)
            ->whereIn('channelable_id', $artistIds)
            ->delete();

        // delete albums
        app(DeleteAlbums::class)->execute(
            DB::table('artist_album')
                ->whereIn('artist_id', $artistIds)
                ->where('primary', true)
                ->pluck('album_id'),
        );

        // delete tracks
        app(DeleteTracks::class)->execute(
            DB::table('artist_track')
                ->whereIn('artist_id', $artistIds)
                ->where('primary', true)
                ->pluck('track_id')
                ->toArray(),
        );

        Artist::destroy($artists->pluck('id'));
    }
}
