import {DownloadsSettingsDialog} from '@app/web-player/library/downloads/downloads-settings-dialog';
import {AdHost} from '@common/admin/ads/ad-host';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {InfoIcon} from '@ui/icons/material/Info';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Tab} from '@ui/tabs/tab';
import {TabList} from '@ui/tabs/tab-list';
import {TabPanels} from '@ui/tabs/tab-panels';
import {Tabs} from '@ui/tabs/tabs';
import {Tooltip} from '@ui/tooltip/tooltip';
import {useState} from 'react';
import {Outlet, useLocation} from 'react-router';

export function Component() {
  return (
    <div>
      <StaticPageTitle>
        <Trans message="Downloads - Library" />
      </StaticPageTitle>
      <AdHost slot="general_top" className="mb-34" />
      <div className="flex items-center justify-between gap-24">
        <h1 className="w-max whitespace-nowrap text-2xl font-semibold md:w-full">
          <Trans message="Downloads" />
        </h1>
        <DialogTrigger type="modal">
          <Tooltip label={<Trans message="Space usage" />}>
            <IconButton size="md" className="text-muted">
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <DownloadsSettingsDialog />
        </DialogTrigger>
      </div>
      <LibraryTabs />
      <AdHost slot="general_bottom" className="mt-34" />
    </div>
  );
}

function LibraryTabs() {
  const {pathname} = useLocation();
  const [selectedTab, setSelectedTab] = useState<number>(() =>
    getCurrentTab(pathname.split('/').pop()),
  );
  return (
    <Tabs
      className="mt-14"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
    >
      <TabList>
        <Tab to="/library/downloads/songs">
          <Trans message="Songs" />
        </Tab>
        <Tab to="/library/downloads/playlists">
          <Trans message="Playlists" />
        </Tab>
        <Tab to="/library/downloads/albums">
          <Trans message="Albums" />
        </Tab>
      </TabList>
      <TabPanels>
        <Outlet />
      </TabPanels>
    </Tabs>
  );
}

function getCurrentTab(lastSegment: string | undefined): number {
  switch (lastSegment) {
    case 'songs':
      return 0;
    case 'playlists':
      return 1;
    case 'albums':
      return 2;
    default:
      return 0;
  }
}
