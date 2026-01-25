<?php

namespace App\Services\Genres;

use App\Models\Genre;

class GenreToApiResource
{
    public function execute(Genre $genre): array
    {
        $resource = [
            'id' => $genre->id,
            'name' => $genre->name,
            'display_name' => $genre->display_name,
            'image' => $genre->image,
            'model_type' => $genre->model_type,
        ];

        if ($genre->artists_count !== null) {
            $resource['artists_count'] = $genre->artists_count;
        }

        return $resource;
    }
}
