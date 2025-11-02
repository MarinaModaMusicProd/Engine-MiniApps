<?php

namespace Common\AI;

use Closure;
use Common\AI\Chat\ChatResponse;
use Common\AI\Embeddings\EmbeddingsResponse;
use Common\AI\Images\GenerateImageResponse;
use Common\AI\Providers\LlmProviderContract;
use Common\AI\Providers\OpenAI\OpenAIProvider;
use Common\AI\Text\EnhanceTextWithAI;
use Common\AI\Text\GeneratedTextResponse;
use Common\AI\Text\TextGeneratorParams;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class Llm
{
    protected LlmProviderContract $provider;

    public function generateEmbeddings(
        string|Collection $input,
        ?string $model = null,
    ): EmbeddingsResponse {
        return $this->provider->generateEmbeddings($input, $model);
    }

    public function enhanceText(array $data): GeneratedTextResponse
    {
        return (new EnhanceTextWithAI())->execute($this->provider, $data);
    }

    public function generateText(
        string $systemPrompt,
        string $prompt,
        TextGeneratorParams $params,
        string $model = null,
    ): GeneratedTextResponse {
        return $this->provider->generateText(
            $systemPrompt,
            $prompt,
            $params,
            $model,
        );
    }

    public function generateImage(
        string $prompt,
        array $data,
        string $model = null,
    ): GenerateImageResponse {
        return $this->provider->generateImage($prompt, $data, $model);
    }

    public function chat(
        string $systemPrompt,
        Collection $messages,
    ): ChatResponse {
        return $this->provider->chat($systemPrompt, $messages);
    }

    public function streamChat(
        string $systemPrompt,
        Collection $messages,
        Closure $callback,
    ): StreamedResponse {
        return response()->stream(
            function () use ($systemPrompt, $messages, $callback) {
                $stream = $this->provider->streamChat($systemPrompt, $messages);
                $callback($stream);
            },
            200,
            [
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
                'X-Accel-Buffering' => 'no',
                'Content-Type' => 'text/event-stream',
            ],
        );
    }

    public function usingDefaultProvider(): static
    {
        $this->provider = new OpenAIProvider();
        return $this;
    }

    public function using(string $provider): static
    {
        $this->provider = new $provider();
        return $this;
    }
}
