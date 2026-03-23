<?php
namespace Common\Search\Drivers\Tnt;

use Laravel\Scout\Builder;
use Laravel\Scout\EngineManager;
use TeamTNT\Scout\Console\ImportCommand;
use TeamTNT\Scout\Console\StatusCommand;
use TeamTNT\TNTSearch\TNTSearch;
use TeamTNT\Scout\TNTSearchScoutServiceProvider as OriginalTNTSearchScoutServiceProvider;

class TNTSearchScoutServiceProvider extends
    OriginalTNTSearchScoutServiceProvider
{
    public function boot()
    {
        $this->app[EngineManager::class]->extend('tntsearch', function ($app) {
            $tnt = new TNTSearch();

            $driver = config('database.default');
            $config =
                config('scout.tntsearch') +
                config("database.connections.{$driver}");

            $tnt->loadConfig($config);
            $tnt->setDatabaseHandle(app('db')->connection()->getPdo());
            $tnt->maxDocs = config('scout.tntsearch.maxDocs', 500);

            $this->setFuzziness($tnt);
            $this->setAsYouType($tnt);

            return new TNTSearchEngine($tnt);
        });

        if ($this->app->runningInConsole()) {
            $this->commands([ImportCommand::class, StatusCommand::class]);
        }

        Builder::macro('constrain', function ($constraints) {
            $this->constraints = $constraints;
            return $this;
        });
    }
}
