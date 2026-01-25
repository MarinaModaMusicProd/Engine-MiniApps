import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {Tab} from '@ui/tabs/tab';
import {TabList} from '@ui/tabs/tab-list';
import {Tabs} from '@ui/tabs/tabs';
import {Suspense} from 'react';
import {Link, Outlet, useMatch, useParams} from 'react-router';

const tagTabNames = ['tracks', 'albums'];

export function Component() {
  return (
    <PlayerPageSuspense>
      <TagPage />
    </PlayerPageSuspense>
  );
}

function TagPage() {
  const params = useParams();
  const tagName = params.tagName!;

  const match = useMatch('/tag/:tagName/:tabName');
  const tabName = match?.params.tabName || 'tracks';
  const selectedTab = tagTabNames.indexOf(tabName) || 0;

  return (
    <div>
      <h1 className="mb-40 text-3xl">
        {tabName === 'albums' ? (
          <Trans
            message="Most popular albums for #:tag"
            values={{tag: tagName}}
          />
        ) : (
          <Trans
            message="Most popular tracks for #:tag"
            values={{tag: tagName}}
          />
        )}
      </h1>
      <Tabs selectedTab={selectedTab}>
        <TabList>
          <Tab elementType={Link} to={`/tag/${tagName}/tracks`}>
            <Trans message="Tracks" />
          </Tab>
          <Tab elementType={Link} to={`/tag/${tagName}/albums`}>
            <Trans message="Albums" />
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
            <Outlet />
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
