import {appQueries} from '@app/app-queries';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {ProfileHeader} from '@app/web-player/users/user-profile/profile-header';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useSuspenseQuery} from '@tanstack/react-query';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {useSettings} from '@ui/settings/use-settings';
import {Tab} from '@ui/tabs/tab';
import {TabList} from '@ui/tabs/tab-list';
import {Tabs} from '@ui/tabs/tabs';
import {Suspense, useCallback} from 'react';
import {Link, Outlet, useMatch} from 'react-router';

const profileTabs = [
  'tracks',
  'playlists',
  'reposts',
  'albums',
  'artists',
  'followers',
  'following',
];

if (!getBootstrapData().settings.player?.enable_repost) {
  profileTabs.splice(2, 1);
}

export function Component() {
  return (
    <PlayerPageSuspense>
      <UserProfilePage />
    </PlayerPageSuspense>
  );
}

function UserProfilePage() {
  const {userId} = useRequiredParams(['userId']);
  const {player} = useSettings();

  const query = useSuspenseQuery(appQueries.userProfile(userId).details);
  const user = query.data.user;

  const match = useMatch('/user/:userId/:userName/:tabName');
  const tabName = match?.params.tabName || 'tracks';

  const selectedTab = profileTabs.indexOf(tabName) || 0;
  const tabLink = useCallback(
    (tabName: string) => {
      return `/user/${user.id}/${user.name}/${tabName}`;
    },
    [user],
  );

  return (
    <>
      <PageMetaTags query={query} />
      {user.image && <PlayerPageHeaderGradient image={user.image} />}
      <div className="relative">
        <ProfileHeader user={user} tabLink={tabLink} />
        <Tabs className="mt-48" isLazy selectedTab={selectedTab}>
          <TabList>
            <Tab elementType={Link} to={tabLink('tracks')}>
              <Trans message="Liked tracks" />
            </Tab>
            <Tab elementType={Link} to={tabLink('playlists')}>
              <Trans message="Public playlists" />
            </Tab>
            {player?.enable_repost && (
              <Tab elementType={Link} to={tabLink('reposts')}>
                <Trans message="Reposts" />
              </Tab>
            )}
            <Tab elementType={Link} to={tabLink('albums')}>
              <Trans message="Liked albums" />
            </Tab>
            <Tab elementType={Link} to={tabLink('artists')}>
              <Trans message="Liked artists" />
            </Tab>
            <Tab elementType={Link} to={tabLink('followers')}>
              <Trans message="Followers" />
            </Tab>
            <Tab elementType={Link} to={tabLink('following')}>
              <Trans message="Following" />
            </Tab>
          </TabList>
          <div className="mt-24">
            <Suspense
              fallback={
                <div className="flex min-h-124 items-center justify-center">
                  <FullPageLoader />
                </div>
              }
            >
              <Outlet context={user} />
            </Suspense>
          </div>
        </Tabs>
      </div>
    </>
  );
}
