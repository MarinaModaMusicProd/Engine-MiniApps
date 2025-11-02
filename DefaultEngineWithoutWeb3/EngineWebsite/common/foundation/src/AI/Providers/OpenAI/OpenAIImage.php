<?php

namespace Common\AI\Providers\OpenAI;

use Common\AI\Images\GenerateImageResponse;
use Common\AI\TokenUsage;
use OpenAI\Client;

class OpenAIImage
{
    public function __construct(protected Client $client)
    {
    }

    public function generate(
        string $prompt,
        array $data,
        string $model = null,
    ): GenerateImageResponse {
        $response = $this->client->images()->create([
            'model' => $model ?? 'dall-e-3',
            'prompt' => $prompt,
            'n' => 1,
            'size' => $data['size'] ?? '1024x1024',
            'response_format' => 'url',
        ]);

        return new GenerateImageResponse(
            url: $response->data[0]->url,
            size: $data['size'] ?? '1024x1024',
            revisedPrompt: $response->data[0]->revisedPrompt,
            usage: new TokenUsage(1),
        );
    }
}
