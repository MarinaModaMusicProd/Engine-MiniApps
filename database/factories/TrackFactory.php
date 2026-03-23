<?php

namespace Database\Factories;

use App\Models\Track;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrackFactory extends Factory
{
    protected $model = Track::class;

    protected static array $durations = [
        1 => 237935,
        2 => 122267,
        3 => 142550,
        4 => 85368,
        5 => 113879,
        6 => 209528,
        7 => 177110,
        8 => 132671,
        9 => 200568,
        10 => 140983,
    ];

    public function definition(): array
    {
        $sampleNumber = rand(1, 10);
        return [
            'name' => $this->faker->words(rand(2, 5), true),
            'number' => rand(1, 10),
            'duration' => self::$durations[$sampleNumber],
            'image' => $this->faker->imageUrl(240, 240),
            'src' => "tracks/{$sampleNumber}.mp3",
            'created_at' => $this->faker->dateTimeBetween(
                '-1 year',
                'now',
                'UTC',
            ),
            'updated_at' => $this->faker->dateTimeBetween(
                '-1 year',
                'now',
                'UTC',
            ),
            'plays' => $this->faker->numberBetween(865, 596545),
            'description' =>
                $this->faker->text(750) .
                "\n\n Visit: demo-url.com
Visit my bandcamp: demo.bandcamp.com
See me on instagram: www.instagram.com/demo
Read me on twitter: www.twitter.com/demo",
        ];
    }
}
