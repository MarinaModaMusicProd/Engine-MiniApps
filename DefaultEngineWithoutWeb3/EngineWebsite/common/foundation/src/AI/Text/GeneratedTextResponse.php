<?php

namespace Common\AI\Text;

use Common\AI\TokenUsage;

class GeneratedTextResponse
{
    public function __construct(
        public string $systemPrompt,
        public string $prompt,
        public string $output,
        public TokenUsage $usage,
    ) {
    }
}
