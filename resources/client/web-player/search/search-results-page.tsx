import {appQueries} from '@app/app-queries';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {SearchResponse} from '@app/web-player/search/search-response';
import {
  searchResultsTab,
  searchResultsTabNames,
} from '@app/web-player/search/search-results-tab';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useSuspenseQuery} from '@tanstack/react-query';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useSettings} from '@ui/settings/use-settings';
import {Tab} from '@ui/tabs/tab';
import {TabList} from '@ui/tabs/tab-list';
import {Tabs} from '@ui/tabs/tabs';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import debounce from 'just-debounce-it';
import {Fragment, useCallback, useMemo} from 'react';
import {Link, Outlet, useParams} from 'react-router';

export function Component() {
  const {searchQuery} = useParams();
  return (
    <Fragment>
      <MobileSearchBar />
      {searchQuery ? (
        <PlayerPageSuspense resetSuspenseOnNavigate={false}>
          <SearchResults searchQuery={searchQuery} />
        </PlayerPageSuspense>
      ) : (
        <IdleFallback />
      )}
    </Fragment>
  );
}

function MobileSearchBar() {
  const params = useParams();
  const navigate = useNavigate();
  const {trans} = useTrans();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const debouncedNavigate = useCallback(
    debounce(
      (query: string) => navigate(`/search/${query}`, {replace: true}),
      300,
    ),
    [navigate],
  );

  if (!isMobile) {
    return null;
  }

  return (
    <TextField
      defaultValue={params.searchQuery || ''}
      onChange={e => debouncedNavigate(e.target.value)}
      autoFocus
      className="w-full"
      size="lg"
      placeholder={trans(message('Search...'))}
    />
  );
}

function IdleFallback() {
  const {branding} = useSettings();
  return (
    <IllustratedMessage
      className="mt-40"
      image={<SearchIcon size="xl" />}
      imageHeight="h-auto"
      imageMargin="mb-12"
      title={
        <Trans
          message="Search :siteName"
          values={{siteName: branding.site_name}}
        />
      }
      description={
        <Trans message="Find songs, artists, albums, playlists and more." />
      }
    />
  );
}

interface SearchResultsProps {
  searchQuery: string;
}
function SearchResults({searchQuery}: SearchResultsProps) {
  const params = useParams();
  const query = useSuspenseQuery(
    appQueries.search.results('searchPage', searchQuery),
  );
  const results = query.data.results;

  if (!results) {
    throw new Error(`Invalid response from api: ${JSON.stringify(results)}`);
  }

  const activeTabName = (params.tabName ?? 'home') as searchResultsTab;
  const visibleTabNames = useMemo(() => {
    return searchResultsTabNames.filter(
      tabName =>
        tabName === 'home' ||
        results[tabName as keyof SearchResponse['results']]?.data.length,
    );
  }, [results]);

  const tabIndex =
    visibleTabNames.indexOf(activeTabName) > -1
      ? visibleTabNames.indexOf(activeTabName)
      : 0;

  const tabLink = (tabName?: string) => {
    let base = `/search/${searchQuery}`;
    if (tabName) {
      base += `/${tabName}`;
    }
    return base;
  };

  const haveAnyResults = Object.entries(results).some(
    ([, r]) => r?.data.length,
  );

  if (!haveAnyResults) {
    return (
      <IllustratedMessage
        className="mt-40"
        image={<SearchIcon size="xl" />}
        imageHeight="h-auto"
        title={
          <Trans
            message="Not results for “:query“"
            values={{query: searchQuery}}
          />
        }
        description={<Trans message="Please try a different search query" />}
      />
    );
  }

  return (
    <Tabs selectedTab={tabIndex}>
      <TabList>
        <Tab elementType={Link} to={tabLink()}>
          <Trans message="Top results" />
        </Tab>
        {results.tracks?.data.length ? (
          <Tab elementType={Link} to={tabLink('tracks')}>
            <Trans message="Tracks" />
          </Tab>
        ) : null}
        {results.artists?.data.length ? (
          <Tab elementType={Link} to={tabLink('artists')}>
            <Trans message="Artists" />
          </Tab>
        ) : null}
        {results.albums?.data.length ? (
          <Tab elementType={Link} to={tabLink('albums')}>
            <Trans message="Albums" />
          </Tab>
        ) : null}
        {results.playlists?.data.length ? (
          <Tab elementType={Link} to={tabLink('playlists')}>
            <Trans message="Playlists" />
          </Tab>
        ) : null}
        {results.users?.data.length ? (
          <Tab elementType={Link} to={tabLink('users')}>
            <Trans message="Profiles" />
          </Tab>
        ) : null}
      </TabList>
      <div className="pt-8">
        <Outlet context={results} />
      </div>
    </Tabs>
  );
}
