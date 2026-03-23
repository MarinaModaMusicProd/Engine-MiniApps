@extends('common::prerender.base')

@section('head')
    @include($seoTagsView ?? 'seo.landing-page.seo-tags')
@endsection

@section('body')
    @if ($sections = settings('landingPage.sections'))
        @foreach ($sections as $section)
            @php
                $sectionName = $section['name'] ?? null;
                $isHeroSection = str_starts_with((string) $sectionName, 'hero-');
                $title = $section['title'] ?? null;
                $badge = $section['badge'] ?? null;
                $description = $section['description'] ?? null;
                $features = $section['features'] ?? [];
                $buttons = $section['buttons'] ?? [];
            @endphp

            @if ($sectionName === 'footer')
                @continue
            @endif

            @if ($badge)
                <p>{{ $badge }}</p>
            @endif

            @if ($title)
                @if ($isHeroSection)
                    <h1>{{ $title }}</h1>
                @else
                    <h2>{{ $title }}</h2>
                @endif
            @endif

            @if ($description)
                <p>{{ $description }}</p>
            @endif

            @if (! empty($buttons))
                <ul>
                    @foreach ($buttons as $button)
                        @if (! empty($button['label']) || ! empty($button['action']))
                            <li>
                                {{ $button['label'] ?? '' }}
                                @if (! empty($button['action']))
                                        ({{ $button['action'] }})
                                @endif
                            </li>
                        @endif
                    @endforeach
                </ul>
            @endif

            @if (! empty($features))
                <ul>
                    @foreach ($features as $feature)
                        @if (! empty($feature['title']))
                            <li>
                                <h3>{{ $feature['title'] }}</h3>
                                @if (! empty($feature['description']))
                                    <p>{{ $feature['description'] }}</p>
                                @endif
                            </li>
                        @endif
                    @endforeach
                </ul>
            @endif
        @endforeach
    @endif
@endsection
