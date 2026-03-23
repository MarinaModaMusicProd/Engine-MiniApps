<?php

namespace Common\Core\Controllers;

use Illuminate\Routing\Controller;

class CsrfTokenController extends Controller
{
    public function __invoke()
    {
        return response()->json(['csrf_token' => csrf_token()]);
    }
}
