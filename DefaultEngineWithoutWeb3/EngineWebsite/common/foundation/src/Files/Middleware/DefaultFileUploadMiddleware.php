<?php

namespace Common\Files\Middleware;

use Common\Files\Actions\GetUserSpaceUsage;
use Common\Files\Actions\ValidateFileUpload;
use Common\Files\FileEntry;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class DefaultFileUploadMiddleware implements FileUploadMiddlewareContract
{
    public function validate(array $data): Collection|null
    {
        $spaceUsage = Auth::check() ? app(GetUserSpaceUsage::class) : null;

        return (new ValidateFileUpload(
            allowedExtensions: settings('uploads.allowed_extensions'),
            blockedExtensions: settings('uploads.blocked_extensions'),
            maxSize: settings('uploads.max_size'),
            usedSpace: $spaceUsage?->getSpaceUsed(),
            availableSpace: $spaceUsage?->getAvailableSpace(),
        ))->execute($data);
    }

    public function handle(FileEntry $fileEntry, array $data): FileEntry
    {
        return $fileEntry;
    }
}
