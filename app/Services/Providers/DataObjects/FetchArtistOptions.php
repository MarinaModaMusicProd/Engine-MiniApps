<?php

namespace App\Services\Providers\DataObjects;

class FetchArtistOptions
{
    public function __construct(
        public bool $importSimilarArtists = true,
        public bool $importAlbums = true,
    ) {}
}
