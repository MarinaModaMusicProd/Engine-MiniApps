<?php namespace App\Models;

use App\Traits\OrdersByPopularity;
use App\Services\Providers\MusicMetadataProvider;
use Common\Comments\Comment;
use Common\Core\BaseModel;
use Common\Files\Traits\HasAttachedFileEntries;
use Common\Settings\Settings;
use Common\Tags\Tag;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Laravel\Scout\Searchable;

class Album extends BaseModel
{
    use OrdersByPopularity, HasFactory, Searchable, HasAttachedFileEntries;

    const MODEL_TYPE = 'album';

    const RECORD_TYPE_ALBUM = 'album';
    const RECORD_TYPE_SINGLE = 'single';
    const RECORD_TYPE_EP = 'ep';
    const RECORD_TYPE_COMPILATION = 'compilation';

    protected $casts = [
        'id' => 'integer',
        'fully_scraped' => 'boolean',
        'external_popularity' => 'integer',
        'owner_id' => 'integer',
        'plays' => 'integer',
        'views' => 'integer',
        'release_date' => 'date',
    ];

    protected $guarded = [];

    protected $appends = ['model_type'];

    public function artists(): BelongsToMany
    {
        return $this->belongsToMany(Artist::class, 'artist_album')
            ->select([
                'artists.id',
                'artists.name',
                'artists.image_small',
                'artists.verified',
                'artists.disabled',
            ])
            ->orderBy('artist_album.primary', 'desc');
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->orderBy(
            'created_at',
            'desc',
        );
    }

    /**
     * @return MorphMany
     */
    public function reposts()
    {
        return $this->morphMany(Repost::class, 'repostable');
    }

    /**
     * @return BelongsToMany
     */
    public function likes()
    {
        return $this->morphToMany(
            User::class,
            'likeable',
            'likes',
        )->withTimestamps();
    }

    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class, 'album_id')->orderBy('number');
    }

    /**
     * @return HasManyThrough
     */
    public function plays()
    {
        return $this->hasManyThrough(TrackPlay::class, Track::class);
    }

    /**
     * @return MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * @return MorphToMany
     */
    public function genres()
    {
        return $this->morphToMany(Genre::class, 'genreable');
    }

    public function uploadedImage()
    {
        return $this->attachedFileEntriesRelation('uploaded_image');
    }

    #[Scope]
    protected function releasedOnly(Builder $query): void
    {
        $query->where('release_date', '<=', now());
    }

    #[Scope]
    protected function orderByRecordType(
        Builder $query,
        string $tableAlias = 'albums',
    ): void {
        $query->orderByRaw(
            "field(
                {$tableAlias}.record_type,
                '" .
                self::RECORD_TYPE_ALBUM .
                "',
                '" .
                self::RECORD_TYPE_SINGLE .
                "',
                '" .
                self::RECORD_TYPE_EP .
                "',
                '" .
                self::RECORD_TYPE_COMPILATION .
                "'
            )",
        );
    }

    public function needsUpdating(): bool
    {
        if (
            !$this->exists ||
            !(new MusicMetadataProvider(
                settings('metadata_provider'),
            ))->canUpdateAlbum($this) ||
            isCrawler()
        ) {
            return false;
        }

        if (!$this->fully_scraped) {
            return true;
        }
        if (!$this->tracks || $this->tracks->isEmpty()) {
            return true;
        }

        return false;
    }

    public function addPopularityToTracks()
    {
        $highestPlaysCount = $this->tracks->pluck('plays')->max();
        $provider = (new MusicMetadataProvider(
            settings('metadata_provider'),
        ))->getProvider();

        $this->tracks->map(function (Track $track) use (
            $highestPlaysCount,
            $provider,
        ) {
            if ($provider) {
                $track->popularity = $track->external_popularity ?: 50;
            } elseif ($highestPlaysCount) {
                $track->popularity = $track->plays / ($highestPlaysCount / 100);
            } else {
                $track->popularity = 50;
            }
            return $track;
        });
    }

    public function toNormalizedArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image,
            'description' => $this->relationLoaded('artists')
                ? $this->artists->pluck('name')->implode(', ')
                : null,
            'model_type' => self::MODEL_TYPE,
            'created_at' => $this->created_at->timestamp ?? '_null',
            'updated_at' => $this->updated_at->timestamp ?? '_null',
            'release_date' => $this->release_date->timestamp ?? '_null',
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'spotify_id' => $this->spotify_id,
            'artists' => $this->artists->pluck('name'),
            'tags' => $this->tags->pluck('display_name'),
        ];
    }

    public static function filterableFields(): array
    {
        return ['id', 'spotify_id', 'release_date'];
    }

    protected function makeAllSearchableUsing($query)
    {
        return $query->with('artists', 'tags');
    }

    public static function getModelTypeAttribute(): string
    {
        return Album::MODEL_TYPE;
    }
}
