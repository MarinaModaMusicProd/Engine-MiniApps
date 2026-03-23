<?php

namespace Common\Search\Drivers\Tnt;

use TeamTNT\Scout\Engines\TNTSearchEngine as OriginalEngine;

class TNTSearchEngine extends OriginalEngine
{
    public function update($models)
    {
        $this->initIndex($models->first());
        $this->tnt->selectIndex("{$models->first()->searchableAs()}.index");
        $index = $this->tnt->getIndex();
        $index->setPrimaryKey($models->first()->getKeyName());

        $models->each(function ($model) use ($index) {
            if (
                method_exists($model, 'shouldBeSearchable') &&
                !$model->shouldBeSearchable()
            ) {
                return;
            }

            $array = $model->toSearchableArray();

            if (empty($array)) {
                return;
            }

            $array = $this->arrayValuesToStringRecursive($array);

            if ($model->getKey()) {
                $index->update($model->getKey(), $array);
            } else {
                $index->insert($array);
            }
        });
    }

    protected function arrayValuesToStringRecursive(array $array): array
    {
        $newArray = [];

        foreach ($array as $key => $value) {
            if ($key === '_vectors') {
                continue;
            }

            if (!is_array($value)) {
                $newArray[$key] = $value;
            } else {
                $newArray[$key] = implode(
                    ',',
                    $this->arrayValuesToStringRecursive($value),
                );
            }

            return $newArray;
        }
    }
}
