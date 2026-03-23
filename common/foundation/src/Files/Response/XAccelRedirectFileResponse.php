<?php

namespace Common\Files\Response;

use Common\Files\FileEntry;
use Common\Files\Response\FileResponse;

class XAccelRedirectFileResponse implements FileResponse
{
    public function make(FileEntry $entry, array $options)
    {
        $disposition = $options['disposition'];
        header('X-Media-Root: ' . rtrim($entry->getDisk()->path(''), '/'));
        header(
            "X-Accel-Redirect: /uploads/{$entry->getStoragePath(
                $options['useThumbnail'],
            )}",
        );
        header("Content-Type: {$entry->mime}");
        header(
            "Content-Disposition: $disposition; filename=\"" .
                $entry->getNameWithExtension() .
                '"',
        );
        exit();
    }
}
