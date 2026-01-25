import {artistPageTabs} from '@app/web-player/artists/artist-page-tabs';
import {ArtistAboutTab} from '@app/web-player/artists/artist-page/artist-about-tab';
import {ArtistAlbumsTab} from '@app/web-player/artists/artist-page/artist-albums-tab';
import {ArtistTracksTab} from '@app/web-player/artists/artist-page/artist-tracks-tab';
import {DiscographyTab} from '@app/web-player/artists/artist-page/discography-panel/discography-tab';
import {ArtistFollowersTab} from '@app/web-player/artists/artist-page/followers-panel/artist-followers-tab';
import {SimilarArtistsPanel} from '@app/web-player/artists/artist-page/similar-artists-panel';
import {useArtistPageTabs} from '@app/web-player/artists/artist-page/use-artist-page-tabs';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {Tab} from '@ui/tabs/tab';
import {TabList} from '@ui/tabs/tab-list';
import {Tabs} from '@ui/tabs/tabs';
import {Suspense} from 'react';
import {Link, useSearchParams} from 'react-router';

interface Props {
  data: GetArtistResponse;
}
export function ArtistPageTabs({data}: Props) {
  const {selectedIndex, activeTabs} = useArtistPageTabs(data.artist);
  return (
    <Tabs className="mt-24 md:mt-48" selectedTab={selectedIndex}>
      <TabList>
        {activeTabs.map((tab, index) => {
          const to = index === 0 ? '' : `?tab=${tab.name}`;
          switch (`${tab.id}`) {
            case artistPageTabs.discography:
              return (
                <Tab
                  elementType={Link}
                  to={to}
                  key={artistPageTabs.discography}
                >
                  <Trans message="Discography" />
                </Tab>
              );
            case artistPageTabs.similar:
              return (
                <Tab elementType={Link} to={to} key={artistPageTabs.similar}>
                  <Trans message="Similar artists" />
                </Tab>
              );
            case artistPageTabs.about:
              return (
                <Tab elementType={Link} to={to} key={artistPageTabs.about}>
                  <Trans message="About" />
                </Tab>
              );
            case artistPageTabs.tracks:
              return (
                <Tab elementType={Link} to={to} key={artistPageTabs.tracks}>
                  <Trans message="Tracks" />
                </Tab>
              );
            case artistPageTabs.albums:
              return (
                <Tab elementType={Link} to={to} key={artistPageTabs.albums}>
                  <Trans message="Albums" />
                </Tab>
              );
            case artistPageTabs.followers:
              return (
                <Tab elementType={Link} to={to} key={artistPageTabs.followers}>
                  <Trans message="Followers" />
                </Tab>
              );
          }
        })}
      </TabList>
      <div className="mt-12 md:mt-24">
        <Suspense
          // re-render suspense when selected tab changes, otherwise loading spinner won't be visible
          key={selectedIndex}
          fallback={
            <div className="flex min-h-124 items-center justify-center">
              <FullPageLoader />
            </div>
          }
        >
          <ActiveTab data={data} />
        </Suspense>
      </div>
    </Tabs>
  );
}

type ActiveTabProps = {
  data: GetArtistResponse;
};
function ActiveTab({data}: ActiveTabProps) {
  const {activeTabs} = useArtistPageTabs(data.artist);
  const [searchParams] = useSearchParams();
  const tabName = searchParams.get('tab') as keyof typeof artistPageTabs;
  let activeTab = activeTabs.find(t => t.name === tabName);
  if (!activeTab) {
    activeTab = activeTabs[0];
  }
  switch (activeTab.name) {
    case 'discography':
      return <DiscographyTab data={data} />;
    case 'similar':
      return <SimilarArtistsPanel artist={data.artist} />;
    case 'about':
      return <ArtistAboutTab artist={data.artist} />;
    case 'tracks':
      return <ArtistTracksTab data={data} />;
    case 'albums':
      return <ArtistAlbumsTab data={data} />;
    case 'followers':
      return <ArtistFollowersTab data={data} />;
  }
}
