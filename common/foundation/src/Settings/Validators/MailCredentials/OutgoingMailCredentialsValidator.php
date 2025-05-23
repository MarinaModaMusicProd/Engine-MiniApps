<?php

namespace Common\Settings\Validators\MailCredentials;

use Arr;
use Auth;
use Aws\Ses\Exception\SesException;
use Common\CommonServiceProvider;
use Common\Settings\DotEnvEditor;
use Common\Settings\Validators\MailCredentials\MailCredentialsMailable;
use Common\Settings\Validators\SettingsValidator;
use Config;
use Exception;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Mail\MailServiceProvider;
use Mail;
use Str;

class OutgoingMailCredentialsValidator implements SettingsValidator
{
    const KEYS = [
        'mail_driver',
        'mail_host',
        'mail_username',
        'mail_password',
        'mail_port',
        'mail_encryption', // SMTP
        'mailgun_domain',
        'mailgun_secret', // Mailgun
        'ses_key',
        'ses_secret', // Amazon SES
        'sparkpost_secret', // Sparkpost
    ];

    public function fails($values)
    {
        $this->setConfigDynamically($values);

        try {
            Mail::to(Auth::user()->email)->send(new MailCredentialsMailable());
        } catch (Exception $e) {
            app(DotEnvEditor::class)->write(['MAIL_SETUP' => false]);
            return $this->getErrorMessage($e);
        }

        app(DotEnvEditor::class)->write(['MAIL_SETUP' => true]);
    }

    private function setConfigDynamically($settings)
    {
        foreach ($settings as $key => $value) {
            //mail_host => mail.host
            $key = str_replace('_', '.', $key);

            // "mail.*" credentials go into "mail.php" config
            // file, other credentials go into "services.php"
            if ($key === 'mail.driver') {
                $key = 'mail.default';
            } elseif ($key === 'mail_from_address') {
                $key = 'mail.from.address';
            } elseif (!Str::startsWith($key, 'mail.')) {
                $key = "services.$key";
            } else {
                $key = str_replace('mail.', 'mail.mailers.smtp.', $key);
            }

            Config::set($key, $value);
        }

        // make sure laravel uses newly set config
        (new MailServiceProvider(app()))->register();
        (new CommonServiceProvider(app()))->registerCustomMailDrivers();
    }

    /**
     * @param Exception|ClientException $e
     * @return array
     */
    private function getErrorMessage($e)
    {
        $message = null;
        if (config('mail.driver') === 'smtp') {
            $message = $this->getSmtpMessage($e);
        } elseif (config('mail.driver') === 'mailgun') {
            $message = $this->getMailgunMessage($e);
        } elseif (config('mail.driver') === 'ses') {
            $message = $this->getSesMessage($e);
        }

        return $message ?: $this->getDefaultMessage($e);
    }

    private function getSesMessage(SesException $e)
    {
        return ['mail_group' => $e->getAwsErrorMessage()];
    }

    private function getMailgunMessage(ClientException $e)
    {
        $originalContents = $e
            ->getResponse()
            ->getBody()
            ->getContents();
        $errResponse = json_decode($originalContents, true);
        if (is_null($errResponse) && is_string($originalContents)) {
            $errResponse = $originalContents;
        }
        $message = strtolower(Arr::get($errResponse, 'message', $errResponse));

        if (Str::contains($message, 'domain not found')) {
            return [
                'server.mailgun_domain' => 'This mailgun domain is not valid.',
            ];
        } elseif (Str::contains($message, 'forbidden')) {
            return [
                'server.mailgun_secret' => 'This mailgun API Key is not valid.',
            ];
        }

        return [
            'mail_group' =>
                'Could not validate mailgun credentials. Please double check them.',
        ];
    }

    private function getSmtpMessage(Exception $e): ?array
    {
        if (Str::contains($e->getMessage(), 'Connection timed out #110')) {
            return [
                'mail_group' =>
                    'Connection to mail server timed out. This usually indicates incorrect mail credentials. Please double check them.',
            ];
        }

        return null;
    }

    private function getDefaultMessage(Exception $e): array
    {
        return [
            'mail_group' => "Could not validate mail credentials: <br> {$e->getMessage()}",
        ];
    }
}
