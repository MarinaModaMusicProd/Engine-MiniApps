<?php

namespace Common\Core\Install\Commands;

use Common\Core\Install\UpdateActions;
use Illuminate\Console\Command;

class RunUpdateActionsCommand extends Command
{
    protected $signature = 'update:run';

    public function handle(): int
    {
        (new UpdateActions())->execute();

        $this->info('Update complete');

        return Command::SUCCESS;
    }
}
