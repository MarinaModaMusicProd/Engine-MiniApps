import {useOfflineEntitiesStore} from '@app/offline/offline-entities-store';
import {OfflineQueueToast} from '@app/offline/offline-queue-toast';
import {MobileNavbar} from '@app/web-player/layout/mobile-navbar';
import {PlayerNavbar} from '@app/web-player/layout/player-navbar';
import {QueueSidenav} from '@app/web-player/layout/queue/queue-sidenav';
import {Sidenav} from '@app/web-player/layout/sidenav';
import {PlayerOverlay} from '@app/web-player/overlay/player-overlay';
import {DesktopPlayerControls} from '@app/web-player/player-controls/desktop-player-controls';
import {MobilePlayerControls} from '@app/web-player/player-controls/mobile-player-controls';
import {playerStoreOptions} from '@app/web-player/state/player-store-options';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {PlayerContext} from '@common/player/player-context';
import {DashboardContent} from '@common/ui/dashboard-layout/dashboard-content';
import {DashboardLayout} from '@common/ui/dashboard-layout/dashboard-layout';
import {DashboardSidenav} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {onlineManager} from '@tanstack/react-query';
import {useSettings} from '@ui/settings/use-settings';
import {useIsTabletMediaQuery} from '@ui/utils/hooks/is-tablet-media-query';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import clsx from 'clsx';
import {Outlet} from 'react-router';

// if the service worker initializes with the window being offline, set the online manager to offline
if ((window as any).beSwInitialIsOffline) {
  onlineManager.setOnline(false);
}

export function WebPlayerLayout() {
  const {player} = useSettings();
  const isMobile = useIsTabletMediaQuery();

  const content = isMobile ? (
    <div className="flex h-screen flex-col bg-elevated">
      <MobileNavbar />
      <Main />
      <MobilePlayerControls />
    </div>
  ) : (
    <DashboardLayout
      name="web-player"
      initialRightSidenavStatus={player?.hide_queue ? 'closed' : 'open'}
      className="bg-alt dark:bg"
    >
      <PlayerNavbar />
      <DashboardSidenav
        position="left"
        display="block"
        className="player-section mx-8"
      >
        <Sidenav />
      </DashboardSidenav>
      <DashboardContent>
        <Main />
      </DashboardContent>
      <RightSidenav />
      <DesktopPlayerControls />
    </DashboardLayout>
  );

  return (
    <PlayerContext id="web-player" options={playerStoreOptions}>
      {content}
      <PlayerOverlay />
      <OfflineQueueToastWrapper />
    </PlayerContext>
  );
}

function OfflineQueueToastWrapper() {
  const offlineQueueSize = useOfflineEntitiesStore(s => s.offlineQueue.size);
  const offlineToastVisible = useOfflineEntitiesStore(
    s => s.offlineToastVisible,
  );
  if (!offlineToastVisible || offlineQueueSize === 0) {
    return null;
  }
  return <OfflineQueueToast />;
}

interface MainProps {
  className?: string;
}
function Main({className}: MainProps) {
  return (
    <main
      className={clsx(
        'compact-scrollbar player-section relative flex-auto overflow-x-hidden stable-scrollbar',
        className,
      )}
    >
      <div className="web-player-container mx-auto min-h-full p-16 @container md:p-30">
        <Outlet />
      </div>
    </main>
  );
}

function RightSidenav() {
  const isOverlay = useMediaQuery('(max-width: 1280px)');
  const hideQueue = usePlayerStore(s => !s.shuffledQueue.length);
  return (
    <DashboardSidenav
      position="right"
      size="w-256"
      mode={isOverlay ? 'overlay' : undefined}
      overlayPosition="absolute"
      display="block"
      forceClosed={hideQueue}
      className="player-section mx-8"
    >
      <QueueSidenav />
    </DashboardSidenav>
  );
}
