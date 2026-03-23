<?php

namespace Common\Core\Resources;

use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaginatedResponseCollection extends AnonymousResourceCollection
{
    public function paginationInformation($request, $paginated, $default)
    {
        // cursor pagination
        if (isset($paginated['next_cursor'])) {
            return [
                'data' => $paginated['data'],
                'next_cursor' => $paginated['next_cursor'],
                'per_page' => $paginated['per_page'],
                'prev_cursor' => $paginated['prev_cursor'],
            ];
        }

        // shared simple/length aware data
        $pagination = [
            'data' => $paginated['data'],
            'current_page' => $paginated['current_page'],
            'from' => $paginated['from'],
            'next_page' => $paginated['next_page'],
            'per_page' => $paginated['per_page'],
            'prev_page' => $paginated['prev_page'],
            'to' => $paginated['to'],
        ];

        // length aware specific data
        if (isset($paginated['total'])) {
            $pagination['last_page'] = $paginated['last_page'];
            $pagination['total'] = $paginated['total'];
        }

        return [
            'pagination' => $pagination,
        ];
    }
}
