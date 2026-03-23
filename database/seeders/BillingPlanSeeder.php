<?php

namespace Database\Seeders;

use Common\Auth\Permissions\Permission;
use Common\Billing\Models\Product;
use Common\Billing\Products\Actions\CrupdateProduct;
use Illuminate\Database\Seeder;

class BillingPlanSeeder extends Seeder
{
    public function run()
    {
        if (!Product::count()) {
            $this->basicPlan();
            $this->proPlan();
        }
    }

    protected function basicPlan()
    {
        $permissionIds = Permission::pluck('id', 'name');
        $permissions = [
            [
                'id' => $permissionIds['music.create'],
                'restrictions' => json_encode([
                    ['name' => 'minutes', 'value' => 180],
                ]),
            ],
        ];

        (new CrupdateProduct())->execute([
            'name' => 'Basic',
            'free' => true,
            'position' => 1,
            'feature_list' => [
                '3h upload time',
                'Ad supported experience',
                'Listen on browser, phone, tablet or TV',
                'Stream unlimited music',
                'Cancel anytime',
            ],
            'permissions' => $permissions,
        ]);
    }

    protected function proPlan()
    {
        $permissionIds = Permission::pluck('id', 'name');
        $permissions = [
            [
                'id' => $permissionIds['music.create'],
                'restrictions' => json_encode([
                    ['name' => 'minutes', 'value' => null],
                ]),
            ],
        ];

        (new CrupdateProduct())->execute(
            [
                'name' => 'Pro Unlimited',
                'position' => 2,
                'recommended' => true,
                'trial_period_days' => 7,
                'feature_list' => [
                    'Unlimited upload time',
                    'No advertisements',
                    'Download songs',
                    'Pro badge',
                    'Listen on browser, phone and tablet or TV',
                    'Stream unlimited amount of music',
                    'Cancel anytime',
                ],
                'permissions' => $permissions,
                'prices' => [
                    [
                        'amount' => 8,
                        'currency' => 'USD',
                        'interval' => 'month',
                        'interval_count' => 1,
                    ],
                    [
                        'amount' => 43,
                        'currency' => 'USD',
                        'interval' => 'month',
                        'interval_count' => 6,
                    ],
                    [
                        'amount' => 76,
                        'currency' => 'USD',
                        'interval' => 'month',
                        'interval_count' => 12,
                    ],
                ],
            ],
            syncProduct: false,
        );
    }
}
