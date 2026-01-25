@extends('common::prerender.base')

@section('head')
    @include($seoTagsView ?? 'seo.channel-page.seo-tags')
@endsection

@section('body')
    <h1>{{ $channel['name'] }}</h1>

    <ul style="display: flex; flex-wrap: wrap">
        @foreach ($channel['content']['data'] as $item)
            <li>
                @if ($item['model_type'] === 'channel')
                    @foreach ($item['content']['data'] as $subItem)
                        @include('seo.channel-page.channel-content', ['item' => $subItem])
                    @endforeach
                @else
                    @include('seo.channel-page.channel-content', ['item' => $item])
                @endif
            </li>
        @endforeach
    </ul>
@endsection
