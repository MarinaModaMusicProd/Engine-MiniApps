<?php

namespace Database\Factories;

use App\Models\ProfileDetails;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileDetailsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProfileDetails::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'country' => $this->faker->country,
            'city' => $this->faker->country,
            'description' => $this->faker->realText(),
        ];
    }
}
