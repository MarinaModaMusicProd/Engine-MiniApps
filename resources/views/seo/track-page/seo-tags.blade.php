<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary" />
<meta property="og:type" content="music.song" />
<meta property="music.duration" content="{{$track['duration']}}" />
@if(isset($track['album']))
    <meta property="music.album.track" content="{{$track['number']}}" />
    <meta property="music.release_date" content="{{$track['album']['release_date']}}" />
@endif

<title>{{$track['artists'][0]['name']}} - {{ $track['name'] }} - {{ settings('branding.site_name') }}</title>
<meta
    property="og:title"
    content="{{$track['artists'][0]['name']}} - {{ $track['name'] }} - {{ settings('branding.site_name') }}"
/>
<meta property="og:url" content="{{ urls()->track($track) }}" />
<link rel="canonical" href="{{ urls()->track($track) }}" />

@if ($track['image'])
    <meta property="og:image" content="{{urls()->image($track['image'])}}" />
    <meta property="og:width" content="300" />
    <meta property="og:height" content="300" />
@endif

<meta property="og:description" content="{{ $track['name'] }} a song by {{$track['artists'][0]['name']}} on {{ settings('branding.site_name') }}" />
<meta name="description" content="{{ $track['name'] }} a song by {{$track['artists'][0]['name']}} on {{ settings('branding.site_name') }}" />

<script type="application/ld+json">
    {!! collect([
        '@context' => 'http://schema.org',
        '@type' => 'MusicRecording',
        '@id' => urls()->track($track),
        'url' => urls()->track($track),
        'name' => $track['name'],
        'description' => $track['name'] . ' a song by ' . $track['artists'][0]['name'] . ' on ' . settings('branding.site_name'),
        'datePublished' => $track['album']['release_date'] ?? '',
    ])->filter()->toJson() !!}
</script>


