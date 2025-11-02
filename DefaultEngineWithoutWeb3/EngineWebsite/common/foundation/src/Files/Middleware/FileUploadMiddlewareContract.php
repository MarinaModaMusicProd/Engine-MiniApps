<?php

namespace Common\Files\Middleware;

use Common\Files\FileEntry;
use Illuminate\Support\Collection;

interface FileUploadMiddlewareContract
{
    public function validate(array $data): Collection|null;

    public function handle(FileEntry $fileEntry, array $data): FileEntry;
}
