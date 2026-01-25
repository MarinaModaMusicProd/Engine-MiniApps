<?php namespace Common\Core\Install;

use Common\Core\BaseController;
use Common\Settings\DotEnvEditor;
use Illuminate\Support\Facades\Http;

class LicenseController extends BaseController
{
    public function __construct()
    {
        $this->middleware('isAdmin');
    }

    public function registerPurchaseCode()
    {
        $this->blockOnDemoSite();

        $data = $this->validate(request(), [
            'purchase_code' => 'required|string',
            'module' => 'string',
        ]);
        $moduleName = $data['module'] ?? null;

        // get envato item ID for specified module or main app
        $envatoItemId = $moduleName
            ? config("modules.$moduleName.envato_item_id")
            : config('app.envato_item_id');
        if (!$envatoItemId) {
            return $this->error('Could not find envato item ID');
        }

        // register purchase code with vebto support site
        $response = Http::withOptions(['verify' => false])->post(
            'https://support.vebto.com/envato/register-purchase-code',
            [
                'purchase_code' => $data['purchase_code'],
                'item_id' => $envatoItemId,
                'domain' => parse_url(config('app.url'), PHP_URL_HOST),
            ],
        );
        if ($response->failed()) {
            if ($response->status() === 422) {
                return $this->error(
                    $response->json('message'),
                    $response->json('errors'),
                );
            } else {
                return $this->error($response->toException()->getMessage());
            }
        }

        $registeredCode = $response->json('purchase_code');
        if (!$registeredCode) {
            return $this->error(
                'Could not register purchase code. Please try again.',
            );
        }

        // store purchase code in .env file
        $key = 'ENVATO_PURCHASE_CODE';

        if ($moduleName) {
            $key = strtoupper($moduleName) . '_ENVATO_PURCHASE_CODE';
        }

        (new DotEnvEditor())->write([
            $key => $registeredCode,
        ]);

        return $this->success([
            'purchase_code' => $registeredCode,
        ]);
    }
}
