<?php

namespace App\Services\Providers\DataObjects;

class NormalizedTrack
{
    /**
     * @param NormalizedArtist[]|null $artists
     * @param NormalizedGenre[]|null $genres
     */
    public function __construct(
        public ?string $externalIdName,
        public ?string $externalId,
        public ?string $name = null,
        public ?string $image = null,
        public ?int $duration = null,
        public ?int $number = null,
        public ?int $popularity = null,
        public ?bool $explicit = false,
        public ?string $isrc = null,
        public ?NormalizedAlbum $album = null,
        public ?array $artists = null,
        public ?array $genres = null,
    ) {}

    public function toInlineDataArray(): array
    {
        return [
            'name' => $this->name,
            $this->externalIdName => $this->externalId,
            'image' => $this->image,
            'duration' => $this->duration,
            'number' => $this->number,
            'external_popularity' => $this->popularity,
            'explicit' => $this->explicit ?: false,
            'isrc' => $this->isrc,
            'updated_at' => now(),
            'created_at' => now(),
        ];
    }
}
