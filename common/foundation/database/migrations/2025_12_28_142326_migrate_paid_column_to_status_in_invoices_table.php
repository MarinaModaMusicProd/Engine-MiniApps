<?php

use Common\Billing\Invoices\Invoice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('invoices', 'paid')) {
            return;
        }

        Invoice::query()
            ->where('paid', true)
            ->update(['status' => 'paid']);
        Invoice::query()
            ->where('paid', false)
            ->update(['status' => 'draft']);

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('paid');
        });
    }
};
