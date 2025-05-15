<?php

namespace Common\AI\Chat;

use Common\AI\TokenUsage;

class ChatResponse
{
    public function __construct(public string $text, public TokenUsage $usage)
    {
    }
}
