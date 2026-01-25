<?php

namespace Common\Settings\Validators;

use Common\Files\Actions\CreateFileEntry;
use Common\Files\Actions\Deletion\PermanentlyDeleteEntries;
use Common\Files\Actions\StoreFile;
use Common\Files\FileEntryPayload;
use Common\Files\Uploads\Uploads;
use Common\Settings\DotEnvEditor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class StaticFileDeliveryValidator implements SettingsValidator
{
    const KEYS = ['static_file_delivery'];

    public function fails($values): bool|array
    {
        if (!$values['static_file_delivery']) {
            return false;
        }

        try {
            $originalDelivery = config('filesystems.static_file_delivery');

            app(DotEnvEditor::class)->write([
                'STATIC_FILE_DELIVERY' => $values['static_file_delivery'],
            ]);

            $previewToken = Str::random(10);

            $localBackend = Arr::first(
                Uploads::getAllBackends(),
                fn($backend) => $backend->type === 'local',
            );
            $path = app('path.common') . '/resources/defaults/lorem.html';
            $contents = file_get_contents($path);
            $uploadedFile = new UploadedFile(
                $path,
                basename($path),
                'text/html',
                filesize($path),
            );
            $payload = new FileEntryPayload([
                'file' => $uploadedFile,
                'backendId' => $localBackend->id,
                'uploadType' => 'brandingImages',
            ]);
            $fileEntry = app(CreateFileEntry::class)->execute($payload);
            $fileEntry->fill(['preview_token' => $previewToken])->save();
            app(StoreFile::class)->execute($payload, ['file' => $uploadedFile]);

            $response = Http::get(
                url($fileEntry->url) . "?preview_token=$previewToken",
            );
            app(PermanentlyDeleteEntries::class)->execute([$fileEntry->id]);

            app(DotEnvEditor::class)->write([
                'STATIC_FILE_DELIVERY' => $originalDelivery,
            ]);
        } catch (Throwable $e) {
            app(DotEnvEditor::class)->write([
                'STATIC_FILE_DELIVERY' => $originalDelivery,
            ]);
            throw $e;
        }

        if ($contents !== $response->body()) {
            return [
                'static_delivery_group' => __(
                    'Could not validate selected optimization. Is it enabled on the server?',
                ),
            ];
        } else {
            return false;
        }
    }
}
