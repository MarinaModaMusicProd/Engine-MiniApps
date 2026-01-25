<?php

namespace Common\Channels;

use App\Models\Channel;
use App\Models\User;
use Carbon\Carbon;
use Common\Core\BaseModel;
use Common\Database\Datasource\Datasource;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

abstract class BaseChannel extends BaseModel
{
    const MODEL_TYPE = 'channel';
    protected $guarded = ['id'];
    protected $appends = ['model_type'];
    protected $hidden = ['pivot', 'internal'];

    protected $casts = [
        'id' => 'integer',
        'public' => 'boolean',
        'internal' => 'boolean',
        'user_id' => 'integer',
    ];

    protected static function booted(): void
    {
        // touch parent channels
        static::updated(function (self $channel) {
            $parentIds = DB::table('channelables')
                ->where('channelable_type', static::MODEL_TYPE)
                ->where('channelable_id', $channel->id)
                ->pluck('channel_id');
            static::withoutEvents(function () use ($parentIds) {
                static::whereIn('id', $parentIds)->update([
                    'updated_at' => Carbon::now(),
                ]);
            });
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function users(): MorphToMany
    {
        return $this->morphedByMany(User::class, 'channelable')->withPivot([
            'id',
            'channelable_id',
            'order',
        ]);
    }

    public function allChannels(
        array $params,
        $builder = null,
    ): AbstractPaginator {
        $datasource = new Datasource(
            ($builder ?? static::query())->where(
                'channels.id',
                '!=',
                $this->id,
            ),
            $params,
        );
        return $datasource->paginate();
    }

    public function channels(): MorphToMany
    {
        return $this->morphedByMany(static::class, 'channelable')->withPivot([
            'id',
            'channelable_id',
            'order',
        ]);
    }

    public function getConfigAttribute(): ?array
    {
        return isset($this->attributes['config'])
            ? json_decode($this->attributes['config'], true)
            : [];
    }

    public function setConfigAttribute($value)
    {
        $this->attributes['config'] = is_array($value)
            ? json_encode($value)
            : $value;
    }

    public function toNormalizedArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image,
            'description' => $this->description
                ? $this->description
                : Arr::get($this->attributes, 'config.seoDescription'),
            'model_type' => static::MODEL_TYPE,
        ];
    }

    public function getNestedChannelPerPage(array $params, $parent): int
    {
        return 15;
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
        ];
    }

    public static function filterableFields(): array
    {
        return ['id', 'created_at', 'updated_at'];
    }

    public static function getModelTypeAttribute(): string
    {
        return static::MODEL_TYPE;
    }

    public function loadRestrictionModel(string $urlParam = null)
    {
        $restriction = null;
        $modelName = $this->config['restriction'];
        $modelId = $this->config['restrictionModelId'] ?? null;
        $model = app(modelTypeToNamespace($modelName))->select([
            'id',
            'name',
            'display_name',
        ]);

        if ($modelId === 'urlParam' && $urlParam) {
            $restriction = $model->where('name', $urlParam)->first();
        } elseif (isset($modelId) && $modelId !== 'urlParam') {
            $restriction = $model->find($modelId);
        }

        if ($restriction && !$restriction->display_name) {
            $restriction->display_name = ucwords($restriction->name);
        }

        return $restriction;
    }

    public function loadContent(
        array $params = [],
        self|null $parent = null,
    ): static {
        $channelContent = (new LoadChannelContent())->execute(
            channel: $this,
            params: $params,
            parent: $parent,
        );

        $this->setRelation('content', $channelContent);
        return $this;
    }

    public function updateContentFromExternal(
        string|null $autoUpdateMethod = null,
    ): void {
        $method =
            $autoUpdateMethod ?? Arr::get($this->config, 'autoUpdateMethod');

        if (
            !$method ||
            Arr::get($this->config, 'contentType') !== 'autoUpdate'
        ) {
            return;
        }

        $content = $this->loadContentFromExternal($method);

        // bail if we could not fetch any content
        if (!$content || $content->isEmpty()) {
            return;
        }

        // detach all channel items from the channel
        DB::table('channelables')
            ->where(['channel_id' => $this->id])
            ->delete();

        // group content by model type (track, album, playlist etc)
        // and attach each group via its own separate relation
        $groupedContent = $content->groupBy('model_type');
        $groupedContent->each(function (Collection $contentGroup, $modelType) {
            $pivots = $contentGroup->mapWithKeys(
                fn($item, $index) => [$item['id'] => ['order' => $index]],
            );
            // track => tracks
            $relation = Str::plural($modelType);
            $this->$relation()->syncWithoutDetaching($pivots->toArray());
        });

        // clear channel cache, it's based on updated_at timestamp
        $this->touch();
    }

    public function toApiResource(
        $isNested = false,
        $normalizeContent = false,
    ): array {
        $resource = [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'updated_at' => $this->updated_at?->toJSON(),
            'restriction' => $this->restriction?->toNormalizedArray(),
            'type' => $this->type,
            'model_type' => static::MODEL_TYPE,
            'config' => [
                'contentModel' => $this->config['contentModel'],
                'hideTitle' => $this->config['hideTitle'] ?? false,
                'layout' => $this->config['layout'] ?? null,
                'nestedLayout' => $this->config['nestedLayout'] ?? null,
            ],
        ];

        if ($this->content) {
            $resource['content'] = [
                'data' => array_map(function ($item) use ($normalizeContent) {
                    if ($normalizeContent) {
                        $normalized = $item->toNormalizedArray();
                        // needed in order to preserve "created_at" date when updating items
                        if (isset($item->pivot)) {
                            $normalized['created_at'] =
                                $item->pivot->created_at;
                        }
                    }
                    return $this->contentItemToApiResource($item);
                }, $this->content->items()),
                'current_page' => $this->content->currentPage(),
                'from' => $this->content->firstItem(),
                'next_page' => $this->content->hasMorePages()
                    ? $this->content->currentPage() + 1
                    : null,
                'per_page' => $this->content->perPage(),
                'prev_page' =>
                    $this->content->currentPage() > 1
                        ? $this->content->currentPage() - 1
                        : null,
                'to' => $this->content->lastItem(),
            ];

            if (method_exists($this->content, 'lastPage')) {
                $resource['content']['last_page'] = $this->content->lastPage();
                $resource['content']['total'] = $this->content->total();
            }
        }

        if (!$isNested) {
            $resource['config']['selectedLayout'] =
                $this->config['selectedLayout'] ?? null;
            $resource['config']['seoTitle'] = $this->config['seoTitle'] ?? null;
            $resource['config']['seoDescription'] =
                $this->config['seoDescription'] ?? null;
        }

        return $resource;
    }

    /**
     * Overriden by child classes to convert content items to API resources.
     */
    public function contentItemToApiResource($item): array
    {
        if ($item instanceof Channel) {
            return $item->toApiResource(isNested: true);
        }

        return $item->toArray();
    }

    public function shouldRestrictContent()
    {
        // when channel is set to auto update, content will be filtered when auto updating
        return Arr::get($this->config, 'contentType') !== 'autoUpdate' &&
            Arr::get($this->config, 'restriction');
    }

    abstract protected function loadContentFromExternal(
        string $autoUpdateMethod,
    ): Collection|array|null;

    public function resolveRouteBinding($value, $field = null)
    {
        $type = request('channelType');
        if (ctype_digit($value)) {
            $channel = $this->when(
                $type,
                fn($q) => $q->where('type', $type),
            )->findOrFail($value);
        } else {
            $channel = $this->where('slug', $value)
                ->when($type, fn($q) => $q->where('type', $type))
                ->firstOrFail();
        }

        return $channel;
    }
}
