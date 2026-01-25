<?php

namespace Common\Auth\Controllers;

use Common\Auth\UserSession;
use Common\Core\BaseController;
use Illuminate\Auth\SessionGuard;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Support\Facades\Auth;

class UserSessionsController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $sessions = Auth::user()
            ->userSessions()
            ->orderBy('updated_at', 'desc')
            ->limit(30)
            ->get()
            ->map(function (UserSession $session) {
                $isCurrentDevice = requestIsFromFrontend()
                    ? $session->session_id === request()->session()->getId()
                    : $session->token ===
                        Auth::user()->currentAccessToken()->token;

                return [
                    'id' => $session->id,
                    'country' => $session->country,
                    'city' => $session->city,
                    'platform' => $session->platform,
                    'browser' => $session->browser,
                    'ip_address' => config('app.demo')
                        ? 'Hidden on demo site'
                        : $session->ip_address,
                    'is_current_device' => $isCurrentDevice,
                    'updated_at' => $session->updated_at,
                ];
            })
            ->values();

        return $this->success(['sessions' => $sessions]);
    }

    public function LogoutOtherSessions(StatefulGuard $guard)
    {
        $this->blockOnDemoSite();

        $data = $this->validate(request(), [
            'password' => 'required',
        ]);

        $guard->logoutOtherDevices($data['password']);

        UserSession::where('user_id', $guard->id())
            ->whereNotNull('session_id')
            ->where('session_id', '!=', request()->session()->getId())
            ->delete();

        return $this->success();
    }
}
