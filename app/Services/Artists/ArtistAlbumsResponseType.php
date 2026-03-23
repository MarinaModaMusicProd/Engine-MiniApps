<?php

namespace App\Services\Artists;

enum ArtistAlbumsResponseType: string
{
    case WITH_TRACKS = 'withTracks';
    case GROUPED_BY_TYPE = 'groupedByType';
    case GRID = 'grid';
}
