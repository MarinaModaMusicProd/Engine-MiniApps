<?php

namespace App\Services\Providers;

use Carbon\Carbon;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

trait UpsertsDataIntoDB
{
    protected function upsert($values, string $table, ?int $chunkSize = 200)
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

        // Preserve original creation timestamp on existing rows; use incoming value for newly inserted rows.
        $columns = Arr::mapWithKeys(
            array_keys(Arr::first($values)),
            fn($column) => [
                $column => DB::raw(
                    $column === 'created_at'
                        ? "coalesce(`$column`, values(`$column`))"
                        : "coalesce(values(`$column`), `$column`)",
                ),
            ],
        );

        foreach (array_chunk($values, max(1, $chunkSize)) as $chunk) {
            DB::table($table)->upsert($chunk, [], $columns);
        }
    }
}
