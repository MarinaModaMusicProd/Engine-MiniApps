@extends('common::prerender.base')

@section('head')
    @include($seoTagsView ?? 'seo.playlist-page.seo-tags')
@endsection

@section('body')
    <h1>{{ $playlist['name'] }}</h1>

    <p>{{ $playlist['description'] }}</p>

    @if (isset($playlist['image']))
        <img src="{{ urls()->image($playlist['image']) }}" alt="" />
    @endif

    @foreach ($tracks['data'] as $track)
        <li>
            <a href="{{ urls()->track($track) }}">{{ $track['name'] }}</a>
        </li>
    @endforeach
@endsection
