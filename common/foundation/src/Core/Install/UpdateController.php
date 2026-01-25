<?php namespace Common\Core\Install;

use App\Models\User;
use Common\Core\BaseController;
use Common\Core\Install\Updater\InstallOrUpdateModule;
use Common\Core\Install\Updater\UpdateApp;
use Common\Settings\DotEnvEditor;
use Exception;
use Illuminate\Support\Facades\Gate;

class UpdateController extends BaseController
{
    public function __construct()
    {
        $disableUpdateAuth =
            (new DotEnvEditor())->load()['disable_update_auth'] ?? false;
        if (
            !$disableUpdateAuth &&
            version_compare(config('app.version'), $this->getAppVersion()) === 0
        ) {
            $this->middleware('isAdmin');
        }
    }

    public function show()
    {
        $this->blockOnDemoSite();

        $data = (new CheckSiteHealth())->execute();
        return view('common::install/update')->with($data);
    }

    public function runManualUpdateActions()
    {
        $this->blockOnDemoSite();

        (new UpdateActions())->execute();

        return view('common::install/update-complete');
    }

    public function runUpdate()
    {
        $this->blockOnDemoSite();

        Gate::allowIf(fn(User $user) => $user->hasPermission('admin'));

        return response()->stream(
            function () {
                $moduleName = request('moduleName');
                $steps = request('steps');

                if ($moduleName && $moduleName !== 'app') {
                    (new InstallOrUpdateModule($moduleName))->execute($steps);
                } else {
                    (new UpdateApp())->execute($steps);
                }
            },
            200,
            [
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
                'X-Accel-Buffering' => 'no',
                'Content-Type' => 'text/event-stream',
            ],
        );
    }

    private function getAppVersion(): string
    {
        try {
            return (new DotEnvEditor('env.example'))->load()['app_version'];
        } catch (Exception $e) {
            return config('app.version');
        }
    }
}
