<?php namespace Common\Auth\Controllers;

use App\Models\User;
use Common\Auth\Oauth;
use Common\Core\BaseController;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class TonConnectController extends BaseController
{
    public function generatePayload(): JsonResponse
    {
        return response()->json(['tonProof' => bin2hex(random_bytes(32))]);
    }

    public function checkTonProof(Request $request): JsonResponse
    {
        // Извлекаем данные из запроса
        $proof = $request->input('proof');
        $account = $request->input('account');

        // Формируем payload, объединяя данные аккаунта и proof
        $payload = [
            'address'    => $account['address'],
            'public_key' => $account['publicKey'],
            'proof'      => array_merge($proof, [
                'state_init' => $account['walletStateInit']
            ])
        ];

        // Декодируем state_init из base64 и загружаем state init
        $stateInitBase64 = $payload['proof']['state_init'];
        $stateInitBinary = base64_decode($stateInitBase64);
        $stateInit = $this->loadStateInit($stateInitBinary);

        // Инициализация клиента TON через HTTP-запросы (используем Guzzle через фасад Http)
        $endpoint = 'https://mainnet-v4.tonhubapi.com';

        // Получаем последний блок
        $lastBlockResponse = Http::get($endpoint . '/getLastBlock');
        if (!$lastBlockResponse->ok()) {
            return response()->json(['error' => 'Ошибка получения последнего блока'], 500);
        }
        $masterAt = $lastBlockResponse->json();

        // Вызываем метод get_public_key у контракта
        // Предполагаем, что API поддерживает вызов метода через HTTP POST
        $addressParsed = $this->parseAddress($payload['address']); // Псевдофункция для парсинга адреса TON
        $runMethodResponse = Http::post($endpoint . '/runMethod', [
            'seqno'   => $masterAt['last']['seqno'],
            'address' => $addressParsed,  // Здесь может потребоваться преобразовать объект в нужный формат
            'method'  => 'get_public_key',
            'params'  => [] // Пустой массив параметров
        ]);
        if (!$runMethodResponse->ok()) {
            return response()->json(['error' => 'Ошибка вызова метода get_public_key'], 500);
        }
        $result = $runMethodResponse->json();

        // Извлекаем публичный ключ из результата
        // Предполагается, что API возвращает большое число в виде строки
        $bigNumber = $result['reader']['bigNumber'];
        // Преобразуем bigNumber в hex-строку с паддингом до 64 символов
        $hexPublicKey = str_pad($this->bcdechex($bigNumber), 64, '0', STR_PAD_LEFT);
        $publicKey = hex2bin($hexPublicKey);
        if (!$publicKey) {
            return response()->json(['valid' => false]);
        }

        // Сравниваем полученный публичный ключ с ожидаемым
        $wantedPublicKey = hex2bin($payload['public_key']);
        if ($publicKey !== $wantedPublicKey) {
            return response()->json(['valid' => false]);
        }

        // Проверяем корректность адреса контракта
        $wantedAddress = $this->parseAddress($payload['address']);
        $computedAddress = $this->contractAddress($wantedAddress->workChain, $stateInit);
        if (!$this->addressEquals($computedAddress, $wantedAddress)) {
            return response()->json(['valid' => false]);
        }

        // Проверка, что доказательство не устарело (не более 15 минут)
        $now = time();
        if ($now - (60 * 15) > $payload['proof']['timestamp']) {
            return response()->json(['valid' => false]);
        }

        return response()->json(['valid' => true]);
    }

    /**
     * Handles case where user is trying to log in with social account whose email
     * already exists in database. Request password for local account in that case.
     */
    public function connectWithPassword(): JsonResponse
    {
        // get data for this social login persisted in session
        $data = $this->oauth->getPersistedData();

        if (!$data) {
            return $this->error(__('There was an issue. Please try again.'));
        }

        if (
            !request()->has('password') ||
            !Auth::validate([
                'email' => $data['profile']->email,
                'password' => request('password'),
            ])
        ) {
            return $this->error(__('Specified credentials are not valid'), [
                'password' => __('This password is not correct.'),
            ]);
        }

        return $this->success($this->oauth->createUserFromOAuthData($data));
    }

    /**
     * Псевдофункция для загрузки state init.
     * Здесь необходимо реализовать парсинг бинарных данных в формат, соответствующий TON.
     */
    private function loadStateInit($binary)
    {
        // Реализуйте логику парсинга TON Cell и получения state init.
        // Для примера просто возвращаем бинарные данные.
        return $binary;
    }

    /**
     * Псевдофункция для парсинга адреса TON.
     *
     * @param string $addressString
     * @return object
     */
    private function parseAddress($addressString)
    {
        // Здесь нужно реализовать корректный парсинг адреса TON.
        // Для примера возвращаем объект с адресом и workChain.
        return (object)[
            'address'   => $addressString,
            'workChain' => 0 // или другое значение в зависимости от адреса
        ];
    }

    /**
     * Псевдофункция для вычисления адреса контракта.
     *
     * @param int $workChain
     * @param mixed $stateInit
     * @return object
     */
    private function contractAddress($workChain, $stateInit)
    {
        // Реализуйте вычисление адреса контракта на основе workChain и stateInit.
        // Для примера возвращаем объект с вычисленным адресом.
        return (object)[
            'address'   => 'computedAddress',
            'workChain' => $workChain
        ];
    }

    /**
     * Псевдофункция для сравнения двух адресов.
     *
     * @param object $addr1
     * @param object $addr2
     * @return bool
     */
    private function addressEquals($addr1, $addr2)
    {
        return $addr1->address === $addr2->address && $addr1->workChain === $addr2->workChain;
    }

    /**
     * Преобразование большого числа (big number) в шестнадцатеричную строку с использованием BCMath.
     * Если число равно 0, возвращает '0'.
     *
     * @param string $number Строковое представление числа
     * @return string
     */
    private function bcdechex($number)
    {
        $hex = '';

        while (bccomp($number, '0') > 0) {
            $mod = bcmod($number, '16');
            $number = bcdiv($number, '16', 0);
            $hex = dechex($mod) . $hex;
        }

        return $hex ?: '0';
    }

}
