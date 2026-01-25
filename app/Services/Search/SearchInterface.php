<?php namespace App\Services\Search;

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;

interface SearchInterface
{
    public function search(
        string $q,
        int $page,
        int $perPage,
        array $modelTypes,
    ): Collection;
    public function artists(): array;
    public function albums(): array;
    public function tracks(): array;
    public function playlists(): array;
    public function users(): array;
    public function channels(): array;
    public function genres(): array;
    public function tags(): array;
}
