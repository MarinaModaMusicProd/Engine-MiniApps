<?php namespace Common\Core\Install\Updater\Steps;

enum UpdaterStepStatus: string
{
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
}
