<?php namespace App\Models;

use App\Traits\OrdersByPopularity;
use App\Services\Providers\MusicMetadataProvider;
use Carbon\Carbon;
use Common\Core\BaseModel;
use Common\Files\Traits\HasAttachedFileEntries;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Laravel\Scout\Searchable;

class Artist extends BaseModel
{
    use OrdersByPopularity, HasFactory, Searchable, HasAttachedFileEntries;

    const MODEL_TYPE = 'artist';

    protected $casts = [
        'id' => 'integer',
        'external_popularity' => 'integer',
        'fully_scraped' => 'boolean',
        'verified' => 'boolean',
        'disabled' => 'boolean',
    ];
    protected $appends = ['model_type'];
    protected $guarded = [];

    public function albums(): BelongsToMany
    {
        return $this->belongsToMany(Album::class, 'artist_album');
    }

    public function tracks(): BelongsToMany
    {
        return $this->belongsToMany(Track::class);
    }

    public function similar()
    {
        return $this->belongsToMany(
            Artist::class,
            'similar_artists',
            'artist_id',
            'similar_id',
            // sort by original insertion order
        )->orderBy('similar_artists.id', 'asc');
    }

    public function genres(): MorphToMany
    {
        return $this->morphToMany(Genre::class, 'genreable');
    }

    public function profile(): HasOne
    {
        return $this->hasOne(ProfileDetails::class);
    }

    public function profileImages(): HasMany
    {
        return $this->hasMany(ProfileImage::class);
    }

    public function links()
    {
        return $this->morphMany(ProfileLink::class, 'linkeable');
    }

    public function followers()
    {
        return $this->morphToMany(
            User::class,
            'likeable',
            'likes',
        )->withTimestamps();
    }

    public function likes(): BelongsToMany
    {
        return $this->morphToMany(
            User::class,
            'likeable',
            'likes',
        )->withTimestamps();
    }

    public function uploadedImage()
    {
        return $this->attachedFileEntriesRelation('uploaded_image');
    }

    public function uploadedProfileImages()
    {
        return $this->attachedFileEntriesRelation('uploaded_profile_image');
    }

    public function toNormalizedArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image_small,
            'model_type' => self::MODEL_TYPE,
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'spotify_id' => $this->spotify_id,
            'created_at' => $this->created_at->timestamp ?? '_null',
            'updated_at' => $this->updated_at->timestamp ?? '_null',
            'disabled' => $this->disabled,
        ];
    }

    public static function filterableFields(): array
    {
        return ['id', 'spotify_id', 'disabled'];
    }

    public function needsUpdating(): bool
    {
        return true;
        if (
            !$this->exists ||
            !(new MusicMetadataProvider(
                settings('metadata_provider'),
            ))->canUpdateArtist($this) ||
            isCrawler()
        ) {
            return false;
        }

        if (!$this->fully_scraped) {
            return true;
        }

        $updateInterval = (int) settings('automation.artist_interval', 7);

        // 0 means that artist should never be updated from 3rd party sites
        if ($updateInterval === 0) {
            return false;
        }

        return !$this->updated_at ||
            $this->updated_at->addDays($updateInterval) <= Carbon::now();
    }

    public static function getModelTypeAttribute(): string
    {
        return Artist::MODEL_TYPE;
    }
}
