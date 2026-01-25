@extends('common::prerender.base')

@section('head')
    @include($seoTagsView ?? 'seo.search-page.seo-tags')
@endsection

@section('body')
    <h1>Search results for "{{ $query }}"</h1>

    <h2>{{ __('Artists') }}</h2>
    <ul class="artists">
        @foreach ($results['artists']['data'] as $artist)
            <li>
                <figure>
                    <img src="{{ $artist['image_small'] }}" />
                    <figcaption>
                        <a href="{{ urls()->artist($artist) }}">
                            {{ $artist['name'] }}
                        </a>
                    </figcaption>
                </figure>
            </li>
        @endforeach
    </ul>

    <h2>{{ __('Albums') }}</h2>
    <ul class="albums">
        @foreach ($results['albums']['data'] as $album)
            <li>
                <figure>
                    <img src="{{ $album['image'] }}" />
                    <figcaption>
                        <a href="{{ urls()->album($album) }}">
                            {{ $album['name'] }}
                        </a>
                    </figcaption>
                </figure>
            </li>
        @endforeach
    </ul>

    <h2>{{ __('Tracks') }}</h2>
    <ul class="tracks">
        @foreach ($results['tracks']['data'] as $track)
            @isset($track['album'])
                <li>
                    <figure>
                        <img src="{{ $track['album']['image'] }}" />
                        <figcaption>
                            <a href="{{ urls()->track($track) }}">
                                {{ $track['name'] }}
                            </a>
                            by
                            @if (isset($track['album']['artist']))
                                <a
                                    href="{{ urls()->artist($track['album']['artist']) }}"
                                >
                                    {{ $track['album']['artist']['name'] }}
                                </a>
                            @endif
                        </figcaption>
                    </figure>
                </li>
            @endisset
        @endforeach
    </ul>

    <h2>{{ __('Playlists') }}</h2>
    <ul class="playlists">
        @foreach ($results['playlists']['data'] as $playlist)
            <li>
                <figure>
                    <img src="{{ $playlist['image'] }}" />
                    <figcaption>
                        <a href="{{ urls()->playlist($playlist) }}">
                            {{ $playlist['name'] }}
                        </a>
                    </figcaption>
                </figure>
            </li>
        @endforeach
    </ul>

    @if (isset($results['users']))
        <h2>{{ __('Users') }}</h2>
        <ul class="users">
            @foreach ($results['users']['data'] as $user)
                <li>
                    <figure>
                        <img src="{{ $user['image'] }}" />
                        <figcaption>
                            <a href="{{ urls()->user($user) }}">
                                {{ $user['name'] }}
                            </a>
                        </figcaption>
                    </figure>
                </li>
            @endforeach
        </ul>
    @endif
@endsection
