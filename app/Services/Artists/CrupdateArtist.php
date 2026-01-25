<?php

namespace App\Services\Artists;

use App\Models\Artist;
use App\Models\Genre;
use App\Models\ProfileImage;
use Common\Files\Actions\SyncFileEntryModels;
use Common\Files\FileEntry;
use Illuminate\Support\Arr;

class CrupdateArtist
{
    public function execute($data, Artist|null $artist = null): Artist
    {
        if (!$artist) {
            $artist = app(Artist::class)->newInstance();
        }

        $initialImage = $artist->image_small;

        $artist
            ->fill([
                'name' => $data['name'],
                'verified' => $data['verified'] ?? false,
                'image_small' => Arr::get($data, 'image_small'),
                'spotify_id' =>
                    $data['spotify_id'] ?? Arr::get($artist, 'spotify_id'),
                'disabled' => $data['disabled'] ?? false,
            ])
            ->save();

        if (Arr::get($data, 'genres')) {
            $genreIds = app(Genre::class)
                ->insertOrRetrieve(Arr::get($data, 'genres'))
                ->pluck('id');
            $artist->genres()->sync($genreIds);
        }

        if ($profile = Arr::get($data, 'profile')) {
            $artist->profile()->updateOrCreate(
                ['artist_id' => $artist->id],
                [
                    'description' => $profile['description'] ?? null,
                    'country' => $profile['country'] ?? null,
                    'city' => $profile['city'] ?? null,
                ],
            );
        }

        if (array_key_exists('links', $data)) {
            $links = array_filter(
                $data['links'],
                fn($link) => Arr::get($link, 'url') && Arr::get($link, 'title'),
            );
            $artist->links()->delete();
            $artist->links()->createMany($links);
        }

        if (array_key_exists('profile_images', $data)) {
            if (empty($data['profile_images'])) {
                $artist->profileImages()->delete();
            } else {
                $this->syncProfileImages($artist, $data);
            }
        }

        if ($initialImage !== $artist->image_small) {
            (new SyncFileEntryModels())->fromUrl(
                $artist->image_small,
                $artist->uploadedImage(),
            );
        }

        return $artist;
    }

    public function syncProfileImages(Artist $artist, array $images): void
    {
        $currentProfileImages = $artist->profileImages()->get();
        $imagesToDelete = [];
        $imagesToCreate = [];

        foreach ($images as $newImage) {
            if (!isset($newImage['id'])) {
                if (!$currentProfileImages->contains('url', $newImage['url'])) {
                    $imagesToCreate[] = $newImage;
                }
            } else {
                if (!$currentProfileImages->contains('id', $newImage['id'])) {
                    $imagesToDelete[] = $newImage['id'];
                }

                if (
                    $newImage['url'] !==
                    $currentProfileImages->where('id', $newImage['id'])->first()
                        ->url
                ) {
                    $artist
                        ->profileImages()
                        ->where('id', $newImage['id'])
                        ->update([
                            'url' => $newImage['url'],
                        ]);
                }
            }
        }

        if (!empty($imagesToDelete)) {
            $artist->profileImages()->whereIn('id', $imagesToDelete)->delete();
        }

        if (!empty($imagesToCreate)) {
            $artist->profileImages()->createMany($imagesToCreate);
        }

        $uploadedImageEntries = $artist
            ->profileImages()
            ->get()
            ->map(function (ProfileImage $image) {
                $fileName = (new SyncFileEntryModels())->entryFileNameFromUrl(
                    $image->url,
                );
                return $fileName
                    ? FileEntry::where('file_name', $fileName)->first()
                    : null;
            })
            ->filter();

        $artist->uploadedProfileImages()->sync($uploadedImageEntries);
    }
}
