<?php

namespace App\Services\Providers\DataObjects;

class NormalizedGenre
{
    public function __construct(
        public ?string $externalIdName,
        public ?string $externalId,
        public ?string $name = null,
        public ?string $displayName = null,
        public ?string $image = null,
    ) {}

    public function toInlineDataArray(): array
    {
        $data = [
            'name' => $this->name,
            'image' => $this->image,
            'display_name' => $this->displayName,
        ];

        // spotify API does not provide genre ids
        if ($this->externalIdName !== 'spotify_id') {
            $data[$this->externalIdName] = $this->externalId;
        }

        return $data;
    }
}
