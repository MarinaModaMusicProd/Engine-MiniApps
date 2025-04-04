<?php

namespace App\Services;

use App\Models\Album;
use Common\Core\Prerender\BaseUrlGenerator;

class UrlGenerator extends BaseUrlGenerator
{
    /**
     * @param array $channel
     * @return string
     */
    public function channel($channel)
    {
        return url($channel['slug']);
    }

    /**
     * @param array $artist
     * @return string
     */
    public function artist($artist)
    {
        return url(
            "artist/{$artist['id']}/" .
                slugify($artist['name'], self::SEPARATOR),
        );
    }

    /**
     * @param array|Album $album
     */
    public function album($album): string
    {
        $albumName = slugify($album['name']);
        $artistName = slugify(
            $album['artists'][0]['name'] ?? 'unknown',
            self::SEPARATOR,
        );
        return url("album/{$album['id']}/$artistName/$albumName");
    }

    /**
     * @param array $track
     * @return string
     */
    public function track($track)
    {
        return url(
            "track/{$track['id']}/" . slugify($track['name'], self::SEPARATOR),
        );
    }

    /**
     * @param array $genre
     * @return string
     */
    public function genre($genre)
    {
        $name = slugify($genre['name'], self::SEPARATOR);
        return url("genre/$name");
    }

    /**
     * @param array $playlist
     * @return string
     */
    public function playlist($playlist)
    {
        $name = slugify($playlist['name'], self::SEPARATOR);
        return url("playlist/{$playlist['id']}/$name");
    }

    /**
     * @param array $user
     * @return string
     */
    public function user($user)
    {
        $name = slugify($user['name'], self::SEPARATOR);
        return url("user/{$user['id']}/$name");
    }

    public function search(string $query): string
    {
        $name = slugify($query, self::SEPARATOR);
        return url("search/$name");
    }

    public function image($path)
    {
        if ($path && !str_starts_with($path, 'http')) {
            return url($path);
        }
        return $path;
    }
}
