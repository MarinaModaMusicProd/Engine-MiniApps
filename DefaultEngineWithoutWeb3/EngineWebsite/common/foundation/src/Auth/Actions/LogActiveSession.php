<?php

namespace Common\Auth\Actions;

use Common\Auth\ActiveSession;
use Laravel\Sanctum\PersonalAccessToken;

class LogActiveSession
{
    public function execute(): void
    {
        if (!auth()->check()) {
            return;
        }

        $token = auth()
            ->user()
            ->currentAccessToken();
        $data = [
            'user_id' => auth()->id(),
            'ip_address' => getIp(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'token' =>
                $token instanceof PersonalAccessToken ? $token->token : null,
        ];

        $sessionId = $data['session_id'] ?? null;
        $token = $data['token'] ?? null;

        $existingSession = app(ActiveSession::class)
            ->when(
                $sessionId,
                fn($query) => $query->where('session_id', $sessionId),
            )
            ->when($token, fn($query) => $query->where('token', $token))
            ->where('user_id', $data['user_id'])
            ->latest()
            ->first();

        if ($existingSession) {
            $existingSession->touch('updated_at');
        } else {
            $this->createNewSession($data);
        }
    }

    protected function createNewSession(array $data): void
    {
        ActiveSession::create([
            'session_id' => $data['session_id'] ?? null,
            'token' => $data['token'] ?? null,
            'user_id' => $data['user_id'],
            'ip_address' => $data['ip_address'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
        ]);
    }
}
