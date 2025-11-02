<?php

namespace Common\AI\Providers;

use Common\AI\Chat\ChatResponse;
use Common\AI\Embeddings\EmbeddingsResponse;
use Common\AI\Images\GenerateImageResponse;
use Common\AI\Text\GeneratedTextResponse;
use Common\AI\Text\TextGeneratorParams;
use Illuminate\Support\Collection;
use Illuminate\Support\LazyCollection;

interface LlmProviderContract
{
    public function generateEmbeddings(
        string|Collection $input,
        string|null $model = null,
    ): EmbeddingsResponse;

    public function generateText(
        string $systemPrompt,
        string $prompt,
        TextGeneratorParams $params,
        string $model = null,
    ): GeneratedTextResponse;

    public function generateImage(
        string $prompt,
        array $data,
        string $model = null,
    ): GenerateImageResponse;

    public function chat(
        string $systemPrompt,
        Collection $messages,
    ): ChatResponse;

    public function streamChat(
        string $systemPrompt,
        Collection $messages,
    ): LazyCollection;
}
