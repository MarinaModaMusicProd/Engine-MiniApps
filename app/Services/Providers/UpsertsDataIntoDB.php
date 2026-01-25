<?php

namespace App\Services\Providers;

use Carbon\Carbon;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

trait UpsertsDataIntoDB
{
    protected function upsert($values, string $table)
    {
        $values = $values instanceof Arrayable ? $values->toArray() : $values;

        // make sure values don't contain any nested arrays (eg. $album['artists])
        $values = array_map(function ($value) {
            return array_filter($value, function ($sub) {
                return $sub instanceof Carbon ||
                    is_scalar($sub) ||
                    is_null($sub);
            });
        }, $values);

        if (empty($values)) {
            return;
        }

        $columns = Arr::mapWithKeys(
            array_keys(Arr::first($values)),
            fn($column) => [
                $column => DB::raw("coalesce(values(`$column`), `$column`)"),
            ],
        );

        DB::table($table)->upsert($values, ['id', 'spotify_id'], $columns);
    }
}
