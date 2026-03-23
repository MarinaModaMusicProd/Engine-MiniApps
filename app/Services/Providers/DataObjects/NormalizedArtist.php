<?php

namespace App\Services\Providers\DataObjects;

class NormalizedArtist
{
    /**
     * @param NormalizedArtist[]|null $similarArtists
     * @param NormalizedTrack[]|null $topTracks
     * @param NormalizedAlbum[]|null $albums
     * @param NormalizedGenre[]|null $genres
     */
    public function __construct(
        public ?string $externalIdName,
        public ?string $externalId,
        public ?string $name = null,
        public ?string $image = null,
        public ?int $popularity = null,
        public ?bool $fullyScraped = null,
        public ?string $updatedAt = null,
        public ?array $similarArtists = null,
        public ?array $topTracks = null,
        public ?array $albums = null,
        public ?array $genres = null,
        public ?string $bioText = null,
        public ?array $bioImages = null,
    ) {}

    public function toInlineDataArray(): array
    {
        return [
            'name' => $this->name,
            $this->externalIdName => $this->externalId,
            'image_small' => $this->image ?? null,
            'external_popularity' => $this->popularity,
            'fully_scraped' => $this->fullyScraped,
            'updated_at' => $this->updatedAt,
            'created_at' => now(),
        ];
    }
}
