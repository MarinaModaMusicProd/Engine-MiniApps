<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Pagination\AbstractPaginator;

trait BuildsPaginatedApiResources
{
    public function buildPagination(
        AbstractPaginator|Paginator $paginator,
        iterable $data,
    ): array {
        if ($paginator instanceof CursorPaginator) {
            return $this->buildCursorPagination($paginator, $data);
        }

        return $this->buildSimplePagination($paginator, $data);
    }

    public function buildSimplePagination(
        AbstractPaginator $paginator,
        iterable $data,
    ): array {
        $pagination = [
            'data' => $data,
            'current_page' => $paginator->currentPage(),
            'from' => $paginator->firstItem(),
            'next_page' => $paginator->hasMorePages()
                ? $paginator->currentPage() + 1
                : null,
            'per_page' => $paginator->perPage(),
            'prev_page' =>
                $paginator->currentPage() > 1
                    ? $paginator->currentPage() - 1
                    : null,
            'to' => $paginator->lastItem(),
        ];

        if (method_exists($paginator, 'lastPage')) {
            $pagination['last_page'] = $paginator->lastPage();
            $pagination['total'] = $paginator->total();
        }

        return $pagination;
    }

    public function buildCursorPagination(
        CursorPaginator $paginator,
        iterable $data,
    ): array {
        return [
            'data' => $data,
            'next_cursor' => $paginator->nextCursor()?->encode(),
            'prev_cursor' => $paginator->previousCursor()?->encode(),
            'per_page' => $paginator->perPage(),
        ];
    }
}
