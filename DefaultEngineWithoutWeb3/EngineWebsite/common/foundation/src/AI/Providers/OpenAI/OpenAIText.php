<?php

namespace Common\AI\Providers\OpenAI;

use Common\AI\Exceptions\LlmException;
use Common\AI\Text\GeneratedTextResponse;
use Common\AI\Text\TextGeneratorParams;
use Common\AI\TokenUsage;
use OpenAI\Client;
use OpenAI\Exceptions\ErrorException;

class OpenAIText
{
    public function __construct(protected Client $client)
    {
    }

    public function generate(
        string $systemPrompt,
        string $prompt,
        TextGeneratorParams $params,
        string|null $model = null,
    ): GeneratedTextResponse {
        try {
            $modelParams = [
                'model' => $model ?? 'gpt-4o-mini',
                'temperature' => $params->temperature,
                'max_tokens' => $params->maxTokens,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ];
            if ($params->jsonFormat) {
                $modelParams['response_format'] = ['type' => 'json_object'];
            }

            $response = $this->client->chat()->create($modelParams);

            return new GeneratedTextResponse(
                $systemPrompt,
                $prompt,
                $response->choices[0]->message->content,
                new TokenUsage(
                    $response->usage->totalTokens,
                    $response->usage->promptTokens,
                ),
            );
        } catch (ErrorException $e) {
            $e->getErrorType() === 'insufficient_quota'
                ? throw LlmException::quotaExceeded()
                : throw LlmException::generic($e->getMessage());
        }
    }
}
