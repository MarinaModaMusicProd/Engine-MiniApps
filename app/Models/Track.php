<?php namespace App\Models;

use App\Traits\OrdersByPopularity;
use Common\Comments\Comment;
use Common\Core\BaseModel;
use Common\Files\Traits\HasAttachedFileEntries;
use Common\Tags\Tag;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Facades\Storage;
use Laravel\Scout\Searchable;

class Track extends BaseModel
{
    use OrdersByPopularity, HasFactory, Searchable, HasAttachedFileEntries;

    const MODEL_TYPE = 'track';

    protected $guarded = [];

    protected $casts = [
        'id' => 'integer',
        'album_id' => 'integer',
        'number' => 'integer',
        'spotify_popularity' => 'integer',
        'duration' => 'integer',
        'position' => 'integer',
        'added_at' => 'datetime',
    ];

    protected $appends = ['model_type'];

    public function likes(): BelongsToMany
    {
        return $this->morphToMany(
            User::class,
            'likeable',
            'likes',
        )->withTimestamps();
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->orderBy(
            'created_at',
            'desc',
        );
    }

    public function reposts(): MorphMany
    {
        return $this->morphMany(Repost::class, 'repostable');
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    public function artists(): BelongsToMany
    {
        return $this->belongsToMany(Artist::class)->select([
            'artists.id',
            'artists.name',
            'artists.image_small',
            'artists.verified',
            'artists.disabled',
        ]);
    }

    public function plays(): HasMany
    {
        return $this->hasMany(TrackPlay::class);
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function genres(): MorphToMany
    {
        return $this->morphToMany(Genre::class, 'genreable');
    }

    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class)->withPivot('position');
    }

    public function lyric(): HasOne
    {
        return $this->hasOne(Lyric::class);
    }

    public function uploadedSrc()
    {
        return $this->attachedFileEntriesRelation('uploaded_src');
    }

    public function uploadedImage()
    {
        return $this->attachedFileEntriesRelation('uploaded_image');
    }

    public function getWaveStorageDisk(): Filesystem
    {
        return Storage::disk(config('filesystems.wave_storage_disk'));
    }

    public function toNormalizedArray(): array
    {
        $image = $this->image;
        if (!$image && $this->relationLoaded('album')) {
            $image = $this->album?->image;
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $image,
            'description' => $this->relationLoaded('artists')
                ? $this->artists->pluck('name')->implode(', ')
                : null,
            'model_type' => self::MODEL_TYPE,
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'album' => $this->album?->name,
            'spotify_id' => $this->spotify_id,
            'artists' => $this->artists->pluck('name'),
            'tags' => $this->tags->pluck('display_name'),
        ];
    }

    protected function makeAllSearchableUsing($query)
    {
        return $query->with(['artists', 'album', 'tags']);
    }

    public static function filterableFields(): array
    {
        return ['id', 'spotify_id'];
    }

    public static function getModelTypeAttribute(): string
    {
        return Track::MODEL_TYPE;
    }
}
