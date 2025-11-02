<?php

namespace Common\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Meilisearch\Endpoints\Indexes;

trait SupportsVectorSearch
{
    abstract public function getVectorDimensions(): int;

    abstract public static function contentWithVectorQuery(): Builder;

    public static function searchUsingVector(
        array $queryVector,
        int $limit = 5,
    ): Collection {
        return static::search(null, function ($index) use (
            $queryVector,
            $limit,
        ) {
            if ($index instanceof Indexes) {
                $options = [
                    'vector' => $queryVector,
                    'showRankingScore' => true,
                    'rankingScoreThreshold' => 0.8,
                    'hybrid' => [
                        'semanticRatio' => 1,
                        'embedder' => static::MODEL_TYPE,
                    ],
                ];

                return collect($index->search(null, $options)['hits'])->map(
                    fn($hit) => [
                        'id' => $hit['id'],
                        'content' => $hit['content'],
                        'score' => $hit['_rankingScore'],
                    ],
                );
            }

            // engine does not have support for vector search, fallback to brute force comparing all vectors
            return static::contentWithVectorQuery()
                ->orderBy((new static())->getQualifiedKeyName())
                ->chunkMap(
                    fn($model) => [
                        'id' => $model->id,
                        'content' => $model->content,
                        'score' => static::cosineSimilarity(
                            $queryVector,
                            json_decode($model->vector, true),
                        ),
                    ],
                    100,
                )
                ->sortByDesc('score')
                ->where('score', '>', 0.5)
                ->values();
        })
            ->raw()
            ->take($limit);
    }

    public static function cosineSimilarity(
        array $vector1,
        array $vector2,
    ): ?float {
        // Ensure both vectors are non-empty and have the same dimensions
        if (count($vector1) !== count($vector2) || count($vector1) === 0) {
            return null;
        }

        // Calculate dot product and magnitudes of both vectors
        $dotProduct = 0.0;
        $magnitude1 = 0.0;
        $magnitude2 = 0.0;

        for ($i = 0; $i < count($vector1); $i++) {
            $dotProduct += $vector1[$i] * $vector2[$i];
            $magnitude1 += $vector1[$i] ** 2;
            $magnitude2 += $vector2[$i] ** 2;
        }

        // Avoid division by zero by checking magnitudes
        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return null;
        }

        // Calculate cosine similarity
        return $dotProduct / (sqrt($magnitude1) * sqrt($magnitude2));
    }
}
