<?php

namespace Common\AI\Text;

class TextGeneratorParams
{
    public function __construct(
        public int $temperature = 1,
        public int $maxTokens = 100,
        public $jsonFormat = false,
    ) {
    }
}
