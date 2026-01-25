<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Services\Albums\PaginateAlbums;
use App\Services\Tracks\PaginateTracks;
use Common\Core\BaseController;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TagMediaController extends BaseController
{
    public function tracks(string $tagName)
    {
        $tag = Tag::where('name', $tagName)->firstOrFail();

        $this->authorize('show', $tag);

        $perPage = request('perPage', 15);

        $pagination = (new PaginateTracks())->asApiResponse(
            [
                'perPage' => $perPage,
                'orderBy' => 'popularity',
                'orderDir' => 'desc',
                'paginate' => 'simple',
            ],
            $tag->tracks(),
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function albums(string $tagName)
    {
        $tag = Tag::where('name', $tagName)->firstOrFail();
        $this->authorize('show', $tag);
        $perPage = request('perPage', 15);

        $pagination = (new PaginateAlbums())->asApiResponse(
            [
                'perPage' => $perPage,
                'orderBy' => 'popularity',
                'orderDir' => 'desc',
                'paginate' => 'simple',
            ],
            $tag->albums(),
            includeTracks: true,
        );

        return $this->success(['pagination' => $pagination]);
    }
}
