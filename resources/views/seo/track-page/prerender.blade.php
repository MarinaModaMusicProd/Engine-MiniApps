@extends('common::prerender.base')

@section('head')
    @include($seoTagsView ?? 'seo.track-page.seo-tags')
@endsection

@section('body')
    <h1>{{ $track['name'] }}</h1>

    <p>
        {{ $track['name'] }} a song by {{ $track['artists'][0]['name'] }} on
        {{ settings('branding.site_name') }}
    </p>

    @if ($track['image'])
        <img src="{{ urls()->image($track['image']) }}" alt="" />
    @endif

    @if (isset($track['album']))
        <ul class="tracks">
            @foreach ($track['album']['tracks'] as $albumTrack)
                <li>
                    <figure>
                        <img
                            src="{{ urls()->image($albumTrack['image'] ?? $track['album']['image']) }}"
                        />
                        <figcaption>
                            <a href="{{ urls()->track($albumTrack) }}">
                                {{ $albumTrack['name'] }}
                            </a>
                            by
                            @foreach ($albumTrack['artists'] as $artist)
                                <a href="{{ urls()->artist($artist) }}">
                                    {{ $artist['name'] }}
                                </a>
                                ,
                            @endforeach
                        </figcaption>
                    </figure>
                </li>
            @endforeach
        </ul>
    @endif
@endsection
