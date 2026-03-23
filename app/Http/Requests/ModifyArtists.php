<?php namespace App\Http\Requests;

use Common\Core\BaseFormRequest;

class ModifyArtists extends BaseFormRequest
{
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'min:1', 'max:255'],
            'country' => 'nullable|string|min:2|max:100',
            'city' => 'nullable|string|min:2|max:100',
            'image_small' => 'string|min:1|max:255|nullable',
            'description' => 'nullable|string',
            'genres' => 'array',
            'disabled' => 'boolean',
        ];

        if ($this->method() === 'POST') {
            $rules = array_merge($rules, [
                'albums' => 'array',
                'albums.*.name' => 'required|string|min:1|max:255',
                'albums.*.release_date' => 'string|min:1|max:255',
                'albums.*.image' => 'string|min:1|max:255',
                'albums.*.artist_id' => 'integer|exists:artists,id',

                'albums.*.tracks' => 'array',
                'albums.*.tracks.*.name' => 'required|string|min:1|max:255',
                'albums.*.tracks.*.number' => 'required|integer|min:1',
                'albums.*.tracks.*.duration' => 'required|integer|min:1',
                'albums.*.tracks.*.artists' => 'string|nullable',
                'albums.*.tracks.*.album_id' => 'integer|min:1',
                'albums.*.tracks.*.src' => 'string|min:1|max:255',
            ]);
        }

        return $rules;
    }
}
