<?php

namespace Common\Search\Drivers\Mysql;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Arr;

class MysqlFullTextIndexer
{
    private string $tableName;

    private string $indexName;

    private array $searchableFields;

    private bool $indexAlreadyExists;

    public function createOrUpdateIndex(string $model): void
    {
        $model = new $model();
        $this->tableName =
            config('database.connections.mysql.prefix') . $model->getTable();
        $this->indexName = $model->searchableAs();

        $this->searchableFields = $model->getSearchableKeys(true);

        if (empty($this->searchableFields)) {
            return;
        }

        $this->indexAlreadyExists = $this->indexExists();

        if (!$this->indexAlreadyExists || $this->indexNeedsUpdate()) {
            $this->dropIndex();
            $fields = implode(',', $this->searchableFields);
            DB::statement(
                "CREATE FULLTEXT INDEX `{$this->indexName}` ON `{$this->tableName}` ($fields)",
            );
        }
    }

    private function indexExists(): bool
    {
        return Schema::hasIndex($this->tableName, $this->indexName);
    }

    private function indexNeedsUpdate(): bool
    {
        $currentIndexFields = $this->searchableFields;
        $expectedIndexFields = $this->getIndexColumns();

        return $currentIndexFields != $expectedIndexFields;
    }

    private function getIndexColumns(): array
    {
        $indexes = Schema::getIndexes($this->tableName);

        $index = Arr::first(
            $indexes,
            fn($idx) => $idx['name'] === $this->indexName,
        );

        return $index['columns'] ?? [];
    }

    private function dropIndex()
    {
        if ($this->indexAlreadyExists) {
            DB::statement(
                "ALTER TABLE $this->tableName DROP INDEX $this->indexName",
            );
        }
    }
}
