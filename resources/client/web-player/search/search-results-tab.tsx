import {appQueries} from '@app/app-queries';
import {ALBUM_MODEL, PartialAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {ARTIST_MODEL, PartialArtist} from '@app/web-player/artists/artist';
import {ArtistGridItem} from '@app/web-player/artists/artist-grid-item';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {
  PartialPlaylist,
  PLAYLIST_MODEL,
} from '@app/web-player/playlists/playlist';
import {PlaylistGridItem} from '@app/web-player/playlists/playlist-grid-item';
import {SearchResponse} from '@app/web-player/search/search-response';
import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {UserGridItem} from '@app/web-player/users/user-grid-item';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {SimplePaginationResponse} from '@common/http/backend-response/pagination-response';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {getScrollParent} from '@react-aria/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {KeyboardArrowRightIcon} from '@ui/icons/material/KeyboardArrowRight';
import {USER_MODEL} from '@ui/types/user';
import {ReactNode, useRef} from 'react';
import {Link, useOutletContext, useParams} from 'react-router';

export const searchResultsTabNames = [
  'home',
  'tracks',
  'artists',
  'albums',
  'playlists',
  'users',
];

export type searchResultsTab = (typeof searchResultsTabNames)[number];

export function Component() {
  const params = useParams();
  const activeTab = params.tabName || 'home';
  const {tracks, artists, albums, playlists, users} =
    useOutletContext<SearchResponse['results']>();
  switch (activeTab) {
    case 'tracks':
      return <PaginatedTrackResults data={tracks} />;
    case 'artists':
      return <PaginatedArtistResults data={artists} />;
    case 'albums':
      return <PaginatedAlbumResults data={albums} />;
    case 'playlists':
      return <PaginatedPlaylistResults data={playlists} />;
    case 'users':
      return <PaginatedProfileResults data={users} />;
    default:
      return <TopResultsPanel />;
  }
}

function TopResultsPanel() {
  const {tracks, artists, albums, playlists, users} =
    useOutletContext<SearchResponse['results']>();
  return (
    <>
      {tracks?.data.length ? (
        <TrackResults data={tracks.data.slice(0, 5)} showMore />
      ) : null}
      {artists?.data.length ? (
        <ArtistResults data={artists.data.slice(0, 5)} showMore />
      ) : null}
      {albums?.data.length ? (
        <AlbumResults data={albums.data.slice(0, 5)} showMore />
      ) : null}
      {playlists?.data.length ? (
        <PlaylistResults data={playlists.data.slice(0, 5)} showMore />
      ) : null}
      {users?.data.length ? (
        <ProfileResults data={users.data.slice(0, 5)} showMore />
      ) : null}
    </>
  );
}

interface ResultPanelProps<T> {
  data: T[];
  showMore?: boolean;
  children?: ReactNode;
}

interface PaginatedResultPanelProps<T> {
  data: SimplePaginationResponse<T> | undefined;
  showMore?: boolean;
}

function TrackResults({data, showMore, children}: ResultPanelProps<Track>) {
  return (
    <div className="py-24">
      <PanelTitle to={showMore ? 'tracks' : undefined}>
        <Trans message="Tracks" />
      </PanelTitle>
      <TrackTable tracks={data} />
      {children}
    </div>
  );
}

function PaginatedTrackResults({
  data,
  showMore,
}: PaginatedResultPanelProps<Track>) {
  const {query, items} = useInfiniteSearchResults<Track>(TRACK_MODEL, data);
  return (
    <TrackResults data={items} showMore={showMore}>
      <InfiniteScrollSentinel query={query} />
    </TrackResults>
  );
}

function ArtistResults({
  data,
  showMore,
  children,
}: ResultPanelProps<PartialArtist>) {
  return (
    <div className="py-24">
      <PanelTitle to={showMore ? 'artists' : undefined}>
        <Trans message="Artists" />
      </PanelTitle>
      <ContentGrid>
        {data.map(artist => (
          <ArtistGridItem key={artist.id} artist={artist} />
        ))}
      </ContentGrid>
      {children}
    </div>
  );
}

function PaginatedArtistResults({
  data,
  showMore,
}: PaginatedResultPanelProps<PartialArtist>) {
  const {query, items} = useInfiniteSearchResults<PartialArtist>(
    ARTIST_MODEL,
    data,
  );
  return (
    <ArtistResults data={items} showMore={showMore}>
      <InfiniteScrollSentinel query={query} />
    </ArtistResults>
  );
}

function AlbumResults({
  data,
  showMore,
  children,
}: ResultPanelProps<PartialAlbum>) {
  return (
    <div className="py-24">
      <PanelTitle to={showMore ? 'albums' : undefined}>
        <Trans message="Albums" />
      </PanelTitle>
      <ContentGrid>
        {data.map(album => (
          <AlbumGridItem key={album.id} album={album} />
        ))}
      </ContentGrid>
      {children}
    </div>
  );
}

function PaginatedAlbumResults({
  data,
  showMore,
}: PaginatedResultPanelProps<PartialAlbum>) {
  const {query, items} = useInfiniteSearchResults<PartialAlbum>(
    ALBUM_MODEL,
    data,
  );
  return (
    <AlbumResults data={items} showMore={showMore}>
      <InfiniteScrollSentinel query={query} />
    </AlbumResults>
  );
}

function PlaylistResults({
  data,
  showMore,
  children,
}: ResultPanelProps<PartialPlaylist>) {
  return (
    <div className="py-24">
      <PanelTitle to={showMore ? 'playlists' : undefined}>
        <Trans message="Playlists" />
      </PanelTitle>
      <ContentGrid>
        {data.map(playlist => (
          <PlaylistGridItem key={playlist.id} playlist={playlist} />
        ))}
      </ContentGrid>
      {children}
    </div>
  );
}

function PaginatedPlaylistResults({
  data,
  showMore,
}: PaginatedResultPanelProps<PartialPlaylist>) {
  const {query, items} = useInfiniteSearchResults<PartialPlaylist>(
    PLAYLIST_MODEL,
    data,
  );
  return (
    <PlaylistResults data={items} showMore={showMore}>
      <InfiniteScrollSentinel query={query} />
    </PlaylistResults>
  );
}

function ProfileResults({
  data,
  showMore,
  children,
}: ResultPanelProps<PartialUserProfile>) {
  return (
    <div className="py-24">
      <PanelTitle to={showMore ? 'users' : undefined}>
        <Trans message="Profiles" />
      </PanelTitle>
      <ContentGrid>
        {data.map(user => (
          <UserGridItem key={user.id} user={user} />
        ))}
      </ContentGrid>
      {children}
    </div>
  );
}

function PaginatedProfileResults({
  data,
  showMore,
}: PaginatedResultPanelProps<PartialUserProfile>) {
  const {query, items} = useInfiniteSearchResults<PartialUserProfile>(
    USER_MODEL,
    data,
  );
  return (
    <ProfileResults data={items} showMore={showMore}>
      <InfiniteScrollSentinel query={query} />
    </ProfileResults>
  );
}

interface PanelTitleProps {
  children: ReactNode;
  to?: string;
}
function PanelTitle({children, to}: PanelTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null!);
  return (
    <h2 className="mb-24 w-max text-2xl font-medium" ref={ref}>
      {to ? (
        <Link
          to={to}
          className="flex items-center gap-2 hover:text-primary"
          onClick={() => {
            const scrollParent = getScrollParent(ref.current);
            if (scrollParent) {
              scrollParent.scrollTo({top: 0});
            }
          }}
        >
          {children}
          <KeyboardArrowRightIcon className="mt-4" />
        </Link>
      ) : (
        children
      )}
    </h2>
  );
}

function useInfiniteSearchResults<T>(
  modelType: string,
  initialData: SimplePaginationResponse<T> | undefined,
) {
  const {searchQuery} = useRequiredParams(['searchQuery']);
  const query = useInfiniteQuery(
    appQueries.search.infiniteResults<T>(modelType, searchQuery, initialData),
  );
  const items = useFlatInfiniteQueryItems(query);
  return {
    query,
    items,
  };
}
