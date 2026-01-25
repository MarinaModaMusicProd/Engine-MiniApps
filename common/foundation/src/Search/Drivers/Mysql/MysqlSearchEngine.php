<?php namespace Common\Search\Drivers\Mysql;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\LazyCollection;
use Laravel\Scout\Builder as ScoutBuilder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Laravel\Scout\Contracts\PaginatesEloquentModelsUsingDatabase;
use Laravel\Scout\Engines\Engine;

class MysqlSearchEngine extends Engine implements
    PaginatesEloquentModelsUsingDatabase
{
    /**
     * Update the given model in the index.
     *
     * @param \Illuminate\Database\Eloquent\Collection $models
     */
    public function update($models): void
    {
        //
    }

    /**
     * Remove the given model from the index.
     *
     * @param \Illuminate\Database\Eloquent\Collection $models
     */
    public function delete($models): void
    {
        //
    }

    public function search(ScoutBuilder $builder)
    {
        return $this->buildSearchQuery($builder, [
            'limit' => $builder->limit,
        ])->get();
    }

    public function paginate(
        ScoutBuilder $builder,
        $perPage,
        $page,
    ): LengthAwarePaginator {
        return $this->paginateUsingDatabase($builder, $perPage, 'page', $page);
    }

    public function paginateUsingDatabase(
        ScoutBuilder $builder,
        $perPage,
        $pageName,
        $page,
    ) {
        return $this->buildSearchQuery($builder)->paginate(
            $perPage,
            ['*'],
            $pageName,
            $page,
        );
    }

    public function simplePaginate(ScoutBuilder $builder, $perPage, $page)
    {
        return $this->simplePaginateUsingDatabase(
            $builder,
            $perPage,
            'page',
            $page,
        );
    }

    public function simplePaginateUsingDatabase(
        ScoutBuilder $builder,
        $perPage,
        $pageName,
        $page,
    ) {
        return $this->buildSearchQuery($builder)->simplePaginate(
            $perPage,
            ['*'],
            $pageName,
            $page,
        );
    }

    protected function buildSearchQuery(
        ScoutBuilder $builder,
        array $options = [],
    ): EloquentBuilder {
        if ($builder->callback) {
            return call_user_func(
                $builder->callback,
                null,
                $builder->query,
                $options,
            );
        }

        $query = $builder->model->mysqlSearch($builder->query);

        if (!empty($builder->orders)) {
            foreach ($builder->orders as $order) {
                $query->orderBy(
                    Arr::get($order, 'column'),
                    Arr::get($order, 'direction'),
                );
            }
        }

        if (isset($options['limit'])) {
            $query = $query->take($options['limit']);
        }
        if (isset($options['offset'])) {
            $query = $query->skip($options['offset']);
        }

        return $query;
    }

    /**
     * Pluck and return the primary keys of the given results.
     *
     * @param mixed $results
     * @return Collection
     */
    public function mapIds($results)
    {
        return $results->pluck('id')->values();
    }

    /**
     * Map the given results to instances of the given model.
     *
     * @param Builder $builder
     * @param mixed $results
     * @param Model $model
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function map(ScoutBuilder $builder, $results, $model)
    {
        return $results;
    }

    /**
     * Get the total count from a raw result returned by the engine.
     *
     * @param mixed $results
     * @return int
     */
    public function getTotalCount($results)
    {
        return count($results);
    }

    /**
     * @inheritDoc
     */
    public function flush($model)
    {
        //
    }

    public function lazyMap(ScoutBuilder $builder, $results, $model)
    {
        return LazyCollection::make($results);
    }

    public function createIndex($name, array $options = [])
    {
        //
    }

    public function deleteIndex($name)
    {
        //
    }
}
