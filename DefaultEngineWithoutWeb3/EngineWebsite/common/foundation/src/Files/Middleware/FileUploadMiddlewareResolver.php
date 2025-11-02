<?php

namespace Common\Files\Middleware;

class FileUploadMiddlewareResolver
{
    public function resolve(string|null $name): FileUploadMiddlewareContract
    {
        if ($name && isset(config('upload-middleware')[$name])) {
            $middleware = config('upload-middleware')[$name];
        } else {
            $middleware = DefaultFileUploadMiddleware::class;
        }

        return new $middleware();
    }
}
