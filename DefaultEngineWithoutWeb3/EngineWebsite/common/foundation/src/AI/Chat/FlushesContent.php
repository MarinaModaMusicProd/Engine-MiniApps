<?php

namespace Common\AI\Chat;

trait FlushesContent
{
    protected function flushContent(string $content): void
    {
        echo $content;
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
}
