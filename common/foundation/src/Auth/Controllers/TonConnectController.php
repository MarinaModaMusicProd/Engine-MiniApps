<?php

namespace Common\Auth\Controllers;

use App\Models\User;
use Common\Auth\Actions\CreateUser;
use Common\Core\BaseController;
use Common\Core\Bootstrap\BootstrapData;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Olifanton\Interop\Address;

class TonConnectController extends BaseController
{
    public function __construct(private CreateUser $createUser)
    {
    }

    public function generatePayload(): JsonResponse
    {
        return response()->json(['tonProof' => bin2hex(random_bytes(32))]);
    }

    public function checkTonProof(Request $request): JsonResponse
    {
        $data = $request->validate([
            'proof' => 'required',
            'account' => 'required',
        ]);

        $proof = $data['proof'];
        $account = $data['account'];

        $account["address"] = str_replace("0:", "", $account["address"]);

        $workChain = 0; // 0 - рабочая сеть
        $address = hex2bin($account["address"]);
        $public_key = hex2bin($account["publicKey"]);

        $timestamp = $proof["timestamp"];
        $domain_length = $proof["domain"]["lengthBytes"];
        $domain_value = $proof["domain"]["value"];
        $signature = base64_decode($proof["signature"]);
        $payload = $proof["payload"];

        // Создание сообщения
        $message = "ton-proof-item-v2/";
        $message .= pack("V", $workChain);  // 4 байта, little-endian
        $message .= $address;
        $message .= pack("V", $domain_length); // 4 байта, little-endian
        $message .= $domain_value;
        $message .= pack("P", $timestamp); // 8 байт, little-endian
        $message .= $payload;

        // Создание сообщения для подписи
        $hashed_message = hash("sha256", $message, true);
        $signature_message = "\xFF\xFF" . utf8_encode(
                "ton-connect"
            ) . $hashed_message;
        $hashed_signature_message = hash("sha256", $signature_message, true);

        try {
            $valid = sodium_crypto_sign_verify_detached(
                $signature,
                $hashed_signature_message,
                $public_key
            );
        } catch (Exception $e) {
            Log::error($e);

            return $this->error(__('There was an issue. Please try again.'));
        }

        if (!$valid) {
            return $this->error(__('Invalid signature.'));
        }

        $addressUserFriendly = (new Address($data['account']["address"]))->toString(true);

        $user = User::where('email', $addressUserFriendly)->first();

        if (!$user) {
            $user = $this->createUser->execute([
                'email' => $addressUserFriendly,
                'password' => Hash::make($proof["signature"]),
            ]);
        }

        if ($user) {
            Auth::loginUsingId($user->id, true);
        }

        return $this->success([
            'bootstrapData' => app(BootstrapData::class)->init()->getEncoded(),
            'two_factor' => false,
        ]);
    }
}
