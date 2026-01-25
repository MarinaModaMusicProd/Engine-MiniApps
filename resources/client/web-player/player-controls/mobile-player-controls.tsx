import {getArtistLink} from '@app/web-player/artists/artist-link';
import {usePrimaryArtistForCurrentUser} from '@app/web-player/backstage/use-primary-artist-for-current-user';
import {webPlayerSidebarIcons} from '@app/web-player/layout/web-player-sidebar-icons';
import {BufferingIndicator} from '@app/web-player/player-controls/buffering-indicator';
import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {playerOverlayState} from '@app/web-player/state/player-overlay-store';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useAuth} from '@common/auth/use-auth';
import {CustomMenuItem} from '@common/menus/custom-menu';
import {useCustomMenu} from '@common/menus/use-custom-menu';
import {useCurrentTime} from '@common/player/hooks/use-current-time';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {NextButton} from '@common/player/ui/controls/next-button';
import {PlayButton} from '@common/player/ui/controls/play-button';
import {PreviousButton} from '@common/player/ui/controls/previous-button';
import {NavbarAuthMenu} from '@common/ui/navigation/navbar/navbar-auth-menu';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Badge} from '@ui/badge/badge';
import {Item} from '@ui/forms/listbox/item';
import {Trans} from '@ui/i18n/trans';
import {MicIcon} from '@ui/icons/material/Mic';
import {PersonIcon} from '@ui/icons/material/Person';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';
import {ProgressBar} from '@ui/progress/progress-bar';
import {useSettings} from '@ui/settings/use-settings';
import clsx from 'clsx';
import {useMemo} from 'react';

export function MobilePlayerControls() {
  return (
    <div className="m-4 rounded-panel border border-divider-lighter shadow dark:border-divider dark:bg-elevated">
      <PlayerControls />
      <MobileNavbar />
    </div>
  );
}

function PlayerControls() {
  const mediaIsCued = usePlayerStore(s => s.cuedMedia != null);
  if (!mediaIsCued) return null;

  return (
    <div
      className="relative flex items-center justify-between gap-24 px-10 py-8"
      onClick={() => {
        playerOverlayState.toggle();
      }}
    >
      <QueuedTrack />
      <PlaybackButtons />
      <PlayerProgressBar />
    </div>
  );
}

function QueuedTrack() {
  const track = useCuedTrack();

  if (!track) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-auto items-center gap-10">
      <TrackImage className="h-36 w-36 rounded object-cover" track={track} />
      <div className="flex-auto overflow-hidden whitespace-nowrap">
        <div className="overflow-hidden overflow-ellipsis text-sm font-medium">
          {track.name}
        </div>
        <div className="overflow-hidden overflow-ellipsis text-xs text-muted">
          {track.artists?.map(a => a.name).join(', ')}
        </div>
      </div>
    </div>
  );
}

function PlaybackButtons() {
  return (
    <div className="flex items-center justify-center">
      <PreviousButton stopPropagation />
      <div className="relative isolate">
        <BufferingIndicator />
        <PlayButton size="md" iconSize="lg" stopPropagation />
      </div>
      <NextButton stopPropagation />
    </div>
  );
}

function PlayerProgressBar() {
  const duration = usePlayerStore(s => s.mediaDuration);
  const currentTime = useCurrentTime();
  return (
    <ProgressBar
      size="xs"
      className="absolute bottom-0 left-0 right-0"
      trackColor="bg-divider"
      trackHeight="h-2"
      radius="rounded-none"
      minValue={0}
      maxValue={duration}
      value={currentTime}
    />
  );
}

function MobileNavbar() {
  const menu = useCustomMenu('mobile-bottom');
  if (!menu) return null;

  return (
    <div className="my-12 flex items-center justify-between gap-30 px-[max(10%,34px)]">
      {menu.items.map(item => (
        <CustomMenuItem
          unstyled
          defaultIcons={webPlayerSidebarIcons}
          iconClassName="block mx-auto mb-6"
          iconSize="md"
          className={({isActive}) =>
            clsx(
              'overflow-hidden whitespace-nowrap text-xs',
              isActive && 'font-bold',
            )
          }
          key={item.id}
          item={item}
        />
      ))}
      <AccountButton />
    </div>
  );
}

function AccountButton() {
  const {user} = useAuth();
  const hasUnreadNotif = !!user?.unread_notifications_count;
  const navigate = useNavigate();
  const {registration} = useSettings();

  const primaryArtist = usePrimaryArtistForCurrentUser();
  const {player} = useSettings();
  const menuItems = useMemo(() => {
    if (primaryArtist) {
      return [
        <MenuItem
          value="author"
          key="author"
          startIcon={<MicIcon />}
          onSelected={() => {
            navigate(getArtistLink(primaryArtist));
          }}
        >
          <Trans message="Artist profile" />
        </MenuItem>,
      ];
    }
    if (player?.show_become_artist_btn) {
      return [
        <MenuItem
          value="author"
          key="author"
          startIcon={<MicIcon />}
          onSelected={() => {
            navigate('/backstage/requests');
          }}
        >
          <Trans message="Become an author" />
        </MenuItem>,
      ];
    }

    return [];
  }, [primaryArtist, navigate, player?.show_become_artist_btn]);

  const button = (
    <button className="relative text-xs">
      <PersonIcon size="md" />
      {hasUnreadNotif ? (
        <Badge className="-top-6" right="right-4">
          {user?.unread_notifications_count}
        </Badge>
      ) : null}
      <div className="text-xs">
        <Trans message="Account" />
      </div>
    </button>
  );

  if (!user) {
    return (
      <MenuTrigger>
        {button}
        <Menu>
          <Item value="login" onSelected={() => navigate('/login')}>
            <Trans message="Login" />
          </Item>
          {!registration?.disable && (
            <Item value="register" onSelected={() => navigate('/register')}>
              <Trans message="Register" />
            </Item>
          )}
        </Menu>
      </MenuTrigger>
    );
  }

  return <NavbarAuthMenu items={menuItems}>{button}</NavbarAuthMenu>;
}
