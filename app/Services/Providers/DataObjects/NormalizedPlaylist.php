<?php

namespace App\Services\Providers\DataObjects;

class NormalizedPlaylist
{
    /**
     * @param NormalizedTrack[]|null $tracks
     */
    public function __construct(
        public ?string $externalIdName,
        public ?string $externalId,
        public ?string $name = null,
        public ?string $description = null,
        public ?string $image = null,
        public ?array $tracks = null,
    ) {}

    public function toInlineDataArray(): array
    {
        return [
            'name' => $this->name,
            $this->externalIdName => $this->externalId,
            'description' => $this->description,
            'image' => $this->image,
        ];
    }
}
