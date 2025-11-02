<?php

namespace Common\AI\Chat;

class ChatStreamChunk
{
    public function __construct(
        public string $content,
        public string $contentSoFar = '',
    ) {
    }
}
