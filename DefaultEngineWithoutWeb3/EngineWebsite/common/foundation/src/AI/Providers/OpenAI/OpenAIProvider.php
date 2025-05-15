<?php

namespace Common\AI\Providers\OpenAI;

use Common\AI\Chat\AssistantMessage;
use Common\AI\Chat\ChatResponse;
use Common\AI\Chat\ChatStreamChunk;
use Common\AI\Chat\UserMessage;
use Common\AI\Embeddings\EmbeddingsResponse;
use Common\AI\Images\GenerateImageResponse;
use Common\AI\Providers\LlmProviderContract;
use Common\AI\Text\GeneratedTextResponse;
use Common\AI\Text\TextGeneratorParams;
use Common\AI\TokenUsage;
use Illuminate\Support\Collection;
use Illuminate\Support\LazyCollection;
use OpenAI;
use OpenAI\Client;

class OpenAIProvider implements LlmProviderContract
{
    protected Client $client;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.api_key'));
    }

    public function generateText(
        string $systemPrompt,
        string $prompt,
        TextGeneratorParams $params,
        string $model = null,
    ): GeneratedTextResponse {
        return (new OpenAIText($this->client))->generate(
            $systemPrompt,
            $prompt,
            $params,
            $model,
        );
    }

    public function generateEmbeddings(
        string|Collection $input,
        string|null $model = null,
    ): EmbeddingsResponse {
        return (new OpenAIEmbeddings($this->client))->generate($input, $model);
    }

    public function generateImage(
        string $prompt,
        array $data,
        string $model = null,
    ): GenerateImageResponse {
        return (new OpenAIImage($this->client))->generate(
            $prompt,
            $data,
            $model,
        );
    }

    public function chat(
        string $systemPrompt,
        Collection $messages,
    ): ChatResponse {
        $response = $this->client
            ->chat()
            ->create($this->buildChatParams($systemPrompt, $messages));

        return new ChatResponse(
            $response->choices[0]->message->content,
            new TokenUsage(
                $response->usage->totalTokens,
                $response->usage->promptTokens,
            ),
        );
    }

    public function streamChat(
        string $systemPrompt,
        Collection $messages,
    ): LazyCollection {
        $stream = $this->client
            ->chat()
            ->createStreamed($this->buildChatParams($systemPrompt, $messages));

        return new LazyCollection(function () use ($stream) {
            $contentSoFar = '';
            foreach ($stream as $response) {
                $chunkContent = $response->choices[0]->delta->content;
                if (!$chunkContent) {
                    continue;
                }

                $contentSoFar .= $chunkContent;

                yield new ChatStreamChunk($chunkContent, $contentSoFar);
            }
        });
    }

    protected function buildChatParams(
        string $systemPrompt,
        Collection $messages,
    ): array {
        return [
            'temperature' => 0.3,
            'max_tokens' => 2000,
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ...$messages
                    ->map(
                        fn(AssistantMessage|UserMessage $message) => [
                            'role' =>
                                $message instanceof AssistantMessage
                                    ? 'assistant'
                                    : 'user',
                            'content' => $message->content,
                        ],
                    )
                    ->toArray(),
            ],
        ];
    }
}
