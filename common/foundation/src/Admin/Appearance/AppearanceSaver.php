<?php namespace Common\Admin\Appearance;

use Common\Admin\Appearance\Themes\CssTheme;
use Common\Settings\DotEnvEditor;
use Common\Settings\Settings;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;

class AppearanceSaver
{
    const CUSTOM_CSS_PATH = 'custom-code/custom-styles.css';
    const CUSTOM_HTML_PATH = 'custom-code/custom-html.html';

    public function __construct(
        protected Settings $settings,
        protected DotEnvEditor $envEditor,
    ) {
    }

    public function save(array $values): void
    {
        if (isset($values['appearance'])) {
            foreach ($values['appearance'] as $groupName => $groupValues) {
                if ($groupName === 'env') {
                    $this->saveEnvSettings($groupValues);
                } elseif ($groupName === 'custom_code') {
                    $this->saveCustomCode($groupValues);
                } elseif ($groupName === 'themes') {
                    $this->syncThemes($groupValues);
                }
            }
        }

        if (!empty($values['settings'])) {
            //generate and store favicon
            if (isset($values['settings']['branding']['favicon'])) {
                $path = $values['settings']['branding']['favicon'];
                unset($values['settings']['branding']['favicon']);
                app(GenerateFavicon::class)->execute($path);
            }

            $this->settings->save($values['settings']);
        }
    }

    private function saveEnvSettings(array $settings): void
    {
        foreach ($settings as $key => $value) {
            $this->envEditor->write([
                $key => $value,
            ]);
        }
    }

    private function saveCustomCode(array $settings): void
    {
        foreach ($settings as $key => $value) {
            $path =
                $key === 'css' ? self::CUSTOM_CSS_PATH : self::CUSTOM_HTML_PATH;

            if (!File::exists(public_path('storage/custom-code'))) {
                File::makeDirectory(public_path('storage/custom-code'));
            }

            File::put(public_path("storage/$path"), trim($value));
        }
    }

    private function syncThemes(array $newThemes): void
    {
        $type = $newThemes[0]['type'];

        // make sure to not remove different type of themes
        $dbThemes = CssTheme::where('type', $type)->get();

        // delete themes that were removed in appearance editor
        $dbThemes->each(function (CssTheme $theme) use ($newThemes) {
            if (
                !Arr::first(
                    $newThemes,
                    fn($current) => $current['id'] == $theme['id'],
                )
            ) {
                $theme->delete();
            }
        });

        // update changed themes and create new ones
        foreach ($newThemes as $theme) {
            $existing = $dbThemes->find($theme['id']);
            $newValue = Arr::except($theme, ['id', 'updated_at']);
            if (!$existing) {
                CssTheme::create(
                    array_merge($newValue, ['user_id' => Auth::id()]),
                );
            } else {
                $existing->fill($newValue)->save();
            }
        }
    }
}
