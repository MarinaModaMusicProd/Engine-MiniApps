<?php

namespace Common\Settings\Manager;

use Common\Settings\DotEnvEditor;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

class ValidateSettingsManagerData
{
    public function execute(): array
    {
        $serverSettings = $this->cleanValues(request('server'), 'server');
        $clientSettings = $this->cleanValues(request('client'), 'client');
        $customCode = request('custom_code')
            ? json_decode(request('custom_code'), true)
            : [];
        $seo = request('seo') ? json_decode(request('seo'), true) : [];
        $themes = request('themes') ? json_decode(request('themes'), true) : [];

        // need to handle files before validating
        $this->handleFiles();

        if (
            $errorMessages = $this->validateSettings(
                $serverSettings,
                $clientSettings,
            )
        ) {
            throw ValidationException::withMessages($errorMessages);
        }

        return [
            'server' => $serverSettings,
            'client' => $clientSettings,
            'custom_code' => $customCode,
            'seo' => $seo,
            'themes' => $themes,
        ];
    }

    protected function cleanValues(string|null $values, string $type): array
    {
        if (!$values) {
            return [];
        }

        $values = json_decode($values);
        $values = settings()->castToArrayPreserveEmptyObjects($values);

        // values from frontend will come in nested object format
        if ($type === 'client') {
            $values = settings()->flatten($values);
        }

        // get current values in flat format as well, so we can easily
        // find value by dot notation key and compare json values
        $current =
            $type === 'client'
                ? settings()->flatten(settings()->all())
                : (new DotEnvEditor())->load();

        $changed = [];
        foreach ($values as $key => $value) {
            $value = is_string($value) ? trim($value) : $value;
            if (!isset($current[$key]) || $current[$key] !== $value) {
                $changed[$key] = $value;
            }
        }

        return $changed;
    }

    protected function handleFiles()
    {
        $files = request()->allFiles();

        // store google analytics certificate file
        if ($certificateFile = Arr::get($files, 'certificate')) {
            File::put(
                storage_path('laravel-analytics/certificate.json'),
                file_get_contents($certificateFile),
            );
        }
    }

    protected function validateSettings(
        array $serverSettings,
        array $clientSettings,
    ): array|null {
        // flatten "client" and "server" arrays into single array
        $values = array_merge(
            $serverSettings ?: [],
            $clientSettings ?: [],
            request()->allFiles(),
        );

        // remove falsy values, because frontend forms will return all
        // possible fields and empty fields will have empty string as value
        $values = array_filter($values);
        $keys = array_keys($values);

        $validators = config('setting-validators');

        foreach ($validators as $validator) {
            $validatorKeys = array_map(
                fn($key) => strtolower($key),
                $validator::KEYS,
            );
            $changedKeys = array_map(fn($key) => strtolower($key), $keys);
            if (empty(array_intersect($validatorKeys, $changedKeys))) {
                continue;
            }

            if ($messages = app($validator)->fails($values)) {
                return $messages;
            }
        }

        return null;
    }
}
