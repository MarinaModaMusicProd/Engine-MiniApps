<?php

namespace App\Services\Providers\DataObjects;

use Illuminate\Support\Arr;

class NormalizedAlbum
{
    public ?array $tracks = null;

    /**
     * @param NormalizedArtist[]|null $artists
     * @param NormalizedTrack[]|null $tracks
     * @param NormalizedGenre[]|null $genres
     */
    public function __construct(
        public ?string $externalIdName,
        public ?string $externalId,
        public ?string $name = null,
        public ?string $upc = null,
        public ?string $recordType = null,
        public ?bool $explicit = false,
        public ?string $image = null,
        public ?string $releaseDate = null,
        public ?int $popularity = null,
        public ?array $artists = null,
        ?array $tracks = null,
        public ?bool $fullyScraped = null,
        public ?string $updatedAt = null,
        public ?array $genres = null,
    ) {
        $this->setTracks($tracks);
    }

    public function setTracks(array|null $tracks = null): void
    {
        $this->tracks = $tracks;
        if (
            !empty($tracks) &&
            Arr::first($tracks, fn(NormalizedTrack $track) => $track->explicit)
        ) {
            $this->explicit = true;
        }
    }

    public function toInlineDataArray(): array
    {
        return [
            'name' => $this->name,
            $this->externalIdName => $this->externalId,
            'upc' => $this->upc,
            'record_type' => $this->recordType,
            'explicit' => $this->explicit ?: false,
            'image' => $this->image,
            'release_date' => $this->releaseDate,
            'external_popularity' => $this->popularity,
            'fully_scraped' => $this->fullyScraped,
            'updated_at' => $this->updatedAt,
            'created_at' => now(),
        ];
    }
}
