<?php namespace Common\Core\Install\Updater\Steps;

enum UpdaterStepName: string
{
    case PREPARING = 'preparing';
    case DOWNLOADING = 'downloading';
    case EXTRACTING = 'extracting';
    case DELETING_OLD_FILES = 'deleting_old_files';
    case MOVING_NEW_FILES = 'moving_new_files';
    case FINALIZING = 'finalizing';
}
