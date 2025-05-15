<?php

namespace Common\AI\Providers\OpenAI;

use Common\AI\Embeddings\EmbeddingsResponse;
use Common\AI\TokenUsage;
use Illuminate\Support\Collection;
use OpenAI\Client;
use OpenAI\Responses\Embeddings\CreateResponseEmbedding;

class OpenAIEmbeddings
{
    public function __construct(protected Client $client)
    {
    }

    public function generate(
        string|Collection $input,
        string|null $model = null,
    ): EmbeddingsResponse {
        $response = $this->client->embeddings()->create([
            'model' => $model ?? 'text-embedding-3-small',
            'input' => is_iterable($input) ? $input->toArray() : $input,
        ]);

        return new EmbeddingsResponse(
            embeddings: collect($response->embeddings)->map(
                fn(CreateResponseEmbedding $embedding) => $embedding->embedding,
            ),
            usage: new TokenUsage(
                totalTokens: $response->usage->totalTokens,
                promptTokens: $response->usage->promptTokens,
            ),
        );
    }
}
