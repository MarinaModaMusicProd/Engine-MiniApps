<?php

namespace Common\Files\Actions;

use Illuminate\Support\Collection;

class ValidateFileUpload
{
    protected array $fileData;

    public function __construct(
        protected array|null $allowedExtensions = null,
        protected array|null $blockedExtensions = null,
        protected int|null $maxSize = null,
        protected int|null $usedSpace = null,
        protected int|null $availableSpace = null,
    ) {
    }

    public function execute(array $fileData): Collection|null
    {
        $this->fileData = $fileData;

        $errors = collect([
            'size' => $this->validateMaximumFileSize(),
            'spaceUsage' => $this->validateAllowedStorageSpace(),
            'allowedExtensions' => $this->validateAllowedExtensions(),
            'blockedExtensions' => $this->validateBlockedExtensions(),
        ])->filter(fn($msg) => !is_null($msg));

        if (!$errors->isEmpty()) {
            return $errors;
        }

        return null;
    }

    protected function validateMaximumFileSize(): ?string
    {
        if (is_null($this->maxSize) || !isset($this->fileData['size'])) {
            return null;
        }

        if ((int) $this->fileData['size'] > $this->maxSize) {
            return __('The file size may not be greater than :size', [
                'size' => self::formatBytes($this->maxSize),
            ]);
        }

        return null;
    }

    protected function validateAllowedStorageSpace(): string|null
    {
        if (!isset($this->fileData['size']) || is_null($this->availableSpace)) {
            return null;
        }

        $usedSpace = $this->usedSpace ?? 0;
        $enoughSpace =
            $usedSpace + $this->fileData['size'] <= $this->availableSpace;

        if (!$enoughSpace) {
            return self::notEnoughSpaceMessage();
        }

        return null;
    }

    protected function validateAllowedExtensions(): string|null
    {
        if (
            !empty($this->allowedExtensions) &&
            !$this->extensionMatches($this->allowedExtensions)
        ) {
            return __('Files of this type are not allowed');
        }

        return null;
    }

    protected function validateBlockedExtensions(): string|null
    {
        if (
            !empty($this->blockedExtensions) &&
            $this->extensionMatches($this->blockedExtensions)
        ) {
            return __('Files of this type are not allowed');
        }

        return null;
    }

    protected function extensionMatches(array $extensions): bool
    {
        if (empty($extensions) || !isset($this->fileData['extension'])) {
            return false;
        }

        $extensions = array_map(
            fn($ext) => str_replace('.', '', $ext),
            $extensions,
        );

        return in_array(
            str_replace('.', '', $this->fileData['extension']),
            $extensions,
        );
    }

    public static function formatBytes(?int $bytes, $unit = 'MB'): string
    {
        if (is_null($bytes)) {
            return '0 bytes';
        }

        if ((!$unit && $bytes >= 1 << 30) || $unit == 'GB') {
            return number_format($bytes / (1 << 30), 1) . 'GB';
        }
        if ((!$unit && $bytes >= 1 << 20) || $unit == 'MB') {
            return number_format($bytes / (1 << 20), 1) . 'MB';
        }
        if ((!$unit && $bytes >= 1 << 10) || $unit == 'KB') {
            return number_format($bytes / (1 << 10), 1) . 'KB';
        }
        return number_format($bytes) . ' bytes';
    }

    public static function notEnoughSpaceMessage(): string
    {
        return __(
            'You have exhausted your allowed space of :space. Delete some files or upgrade your plan.',
            [
                'space' => self::formatBytes(
                    app(GetUserSpaceUsage::class)->getAvailableSpace(),
                ),
            ],
        );
    }
}
