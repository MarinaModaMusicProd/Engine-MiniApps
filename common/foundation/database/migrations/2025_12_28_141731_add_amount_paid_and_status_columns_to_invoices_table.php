<?php

use Common\Billing\Invoices\Invoice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table
                ->integer('amount_paid')
                ->nullable()
                ->after('subscription_id');
            $table->string('status', 40)->default('paid')->after('amount_paid');
            $table->string('currency', 40)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('amount_paid');
            $table->dropColumn('status');
            $table->dropColumn('currency');
        });
    }
};
