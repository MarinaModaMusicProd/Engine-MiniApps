<?php namespace Common\Settings\Manager;

use Common\Core\BaseController;
use Common\Settings\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class SettingsController extends BaseController
{
    public function __construct(protected Request $request) {}

    public function index()
    {
        $this->authorize('index', Setting::class);

        $settings = (new LoadSettingsManagerData())->execute();

        if (config('app.demo')) {
            $settings = (new RedactSensitiveSettings())->execute($settings);
        }

        return $this->success($settings);
    }

    public function update()
    {
        $this->authorize('update', Setting::class);

        $this->blockOnDemoSite();

        $data = (new ValidateSettingsManagerData())->execute();

        (new StoreSettingsManagerData())->execute($data);

        return $this->success();
    }

    public function loadSeoTags()
    {
        $this->authorize('index', Setting::class);

        return response()->json([
            'tags' => (new LoadSettingsManagerData())->loadSeoTags(),
        ]);
    }

    public function loadMenuEditorConfig()
    {
        return (new LoadSettingsManagerData())->loadMenuEditorConfig();
    }
}
