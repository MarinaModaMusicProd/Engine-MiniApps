import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {QueueTrackContextDialog} from '@app/web-player/layout/queue/queue-track-context-dialog';
import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {useMiniPlayerIsHidden} from '@app/web-player/overlay/use-mini-player-is-hidden';
import {DownloadTrackButton} from '@app/web-player/player-controls/download-track-button';
import {LyricsButton} from '@app/web-player/player-controls/lyrics-button';
import {PlaybackControls} from '@app/web-player/player-controls/playback-controls';
import {useCuedTrack} from '@app/web-player/player-controls/use-cued-track';
import {
  playerOverlayState,
  usePlayerOverlayStore,
} from '@app/web-player/state/player-overlay-store';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {usePlayerClickHandler} from '@common/player/hooks/use-player-click-handler';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {MediaItem} from '@common/player/media-item';
import {PlayerPoster} from '@common/player/ui/controls/player-poster';
import {PlayerOutlet} from '@common/player/ui/player-outlet';
import {TableContext} from '@common/ui/tables/table-context';
import {RowElementProps} from '@common/ui/tables/table-row';
import {IconButton} from '@ui/buttons/icon-button';
import {KeyboardArrowDownIcon} from '@ui/icons/material/KeyboardArrowDown';
import {MoreVertIcon} from '@ui/icons/material/MoreVert';
import {MediaFullscreenIcon} from '@ui/icons/media/media-fullscreen';
import {MediaQueueListIcon} from '@ui/icons/media/media-queue-list';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import {usePrevious} from '@ui/utils/hooks/use-previous';
import clsx from 'clsx';
import fscreen from 'fscreen';
import {
  Fragment,
  MutableRefObject,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {useLocation} from 'react-router';

export function PlayerOverlay() {
  const isMaximized = usePlayerOverlayStore(s => s.isMaximized);
  const isQueueOpen = usePlayerOverlayStore(s => s.isQueueOpen);
  const miniPlayerIsHidden = useMiniPlayerIsHidden();
  const overlayRef = useRef<HTMLDivElement>(null);
  const {pathname} = useLocation();
  const previousPathname = usePrevious(pathname);

  // close overlay when route changes
  useEffect(() => {
    if (isMaximized && previousPathname && pathname !== previousPathname) {
      playerOverlayState.toggle();
    }
  }, [pathname, previousPathname, isMaximized]);

  useEffect(() => {
    if (!isMaximized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playerOverlayState.toggle();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  return (
    <div
      ref={overlayRef}
      className={clsx(
        'fixed right-0 isolate overflow-hidden bg outline-none transition-all',
        miniPlayerIsHidden && !isMaximized && 'hidden',
        isMaximized
          ? 'bottom-0 h-full w-full pb-50'
          : 'bottom-[112px] right-8 h-[213px] w-256 rounded-panel',
      )}
    >
      <PlayerContent overlayRef={overlayRef} />
      {isMaximized && isQueueOpen && <PlayerQueue overlayRef={overlayRef} />}
    </div>
  );
}

type PlayerContentProps = {
  overlayRef: RefObject<HTMLDivElement | null>;
};
function PlayerContent({overlayRef}: PlayerContentProps) {
  const isMaximized = usePlayerOverlayStore(s => s.isMaximized);
  const isFullscreen = usePlayerStore(s => s.isFullscreen);
  const playerClickHandler = usePlayerClickHandler();
  const haveVideo = usePlayerStore(
    s => s.providerApi != null && s.providerName !== 'htmlAudio',
  );
  const cuedTrack = useCuedTrack();
  return (
    <div className="h-full w-full">
      {isMaximized && <Gradient />}
      <div
        className={clsx(
          'relative z-10 h-full w-full',
          isMaximized && 'flex flex-col',
        )}
      >
        {isMaximized && <TopControls overlayRef={overlayRef} />}
        <div
          onClick={() => {
            // native video will be put into fullscreen, it will already handle click and double click events
            if (!isFullscreen) {
              playerClickHandler();
            }
          }}
          className={clsx(
            'relative min-h-0 max-w-full flex-auto',
            isMaximized ? 'mx-auto mt-auto px-14' : 'h-full w-full',
            isMaximized && haveVideo
              ? 'aspect-video'
              : 'aspect-square max-h-400',
          )}
        >
          <PlayerPoster
            className="absolute inset-0"
            fallback={
              cuedTrack ? (
                <TrackImage
                  className="h-full w-full"
                  background="bg-[#f5f5f5] dark:bg-[#2c2c35]"
                  track={cuedTrack}
                />
              ) : undefined
            }
          />
          <div
            className={
              haveVideo ? 'h-full w-full flex-auto bg-black' : undefined
            }
          >
            <PlayerOutlet className="h-full w-full" />
          </div>
        </div>
        {isMaximized && (
          <Fragment>
            <QueuedTrack />
            <PlaybackControls className="container mx-auto mb-auto flex-shrink-0 px-14" />
          </Fragment>
        )}
      </div>
    </div>
  );
}

interface FullscreenButtonProps {
  overlayRef: MutableRefObject<HTMLDivElement | null>;
}
function FullscreenButton({overlayRef}: FullscreenButtonProps) {
  const playerReady = usePlayerStore(s => s.providerReady);
  return (
    <IconButton
      className={clsx(
        'ml-12 flex-shrink-0 max-md:hidden',
        !fscreen.fullscreenEnabled && 'hidden',
      )}
      disabled={!playerReady}
      onClick={() => {
        if (!overlayRef.current) return;
        if (fscreen.fullscreenElement) {
          fscreen.exitFullscreen();
        } else {
          fscreen.requestFullscreen(overlayRef.current);
        }
      }}
    >
      <MediaFullscreenIcon />
    </IconButton>
  );
}

function QueuedTrack() {
  const track = useCuedTrack();

  if (!track) {
    return null;
  }

  return (
    <div className="container mx-auto my-40 flex flex-shrink-0 items-center justify-center gap-34 px-14 md:my-60">
      <LikeIconButton likeable={track} />
      <div className="min-w-0 text-center">
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base">
          <TrackLink track={track} />
        </div>
        <div className="text-sm text-muted">
          <ArtistLinks artists={track.artists} />
        </div>
      </div>
      <DialogTrigger type="popover" mobileType="tray">
        <IconButton>
          <MoreVertIcon />
        </IconButton>
        <TrackContextDialog tracks={[track]} />
      </DialogTrigger>
    </div>
  );
}

type PlayerQueueProps = {
  overlayRef: MutableRefObject<HTMLDivElement | null>;
};
function PlayerQueue({overlayRef}: PlayerQueueProps) {
  const queue = usePlayerStore(s => s.shuffledQueue);
  const tracks = queue.map(item => item.meta);
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-20 overflow-y-auto bg">
      <Gradient />
      <div className="relative">
        <TopControls overlayRef={overlayRef} />
        <TrackTable
          className="px-14 md:px-44"
          tracks={tracks}
          queueGroupId={queue[0]?.groupId}
          renderRowAs={PlayerQueueRow}
        />
      </div>
    </div>
  );
}

function PlayerQueueRow({item, children, ...domProps}: RowElementProps<Track>) {
  const queue = usePlayerStore(s => s.shuffledQueue);
  const {selectedRows} = useContext(TableContext);
  const queueItems = useMemo(() => {
    return selectedRows
      .map(trackId => queue.find(item => item.meta.id === trackId))
      .filter(t => !!t) as MediaItem[];
  }, [queue, selectedRows]);

  const row = <div {...domProps}>{children}</div>;
  if (item.isPlaceholder) {
    return row;
  }

  return (
    <DialogTrigger
      type="popover"
      mobileType="tray"
      triggerOnContextMenu
      placement="bottom-start"
    >
      {row}
      <QueueTrackContextDialog queueItems={queueItems} />
    </DialogTrigger>
  );
}

type TopControlsProps = {
  overlayRef: MutableRefObject<HTMLDivElement | null>;
};
function TopControls({overlayRef}: TopControlsProps) {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isQueueOpen = usePlayerOverlayStore(s => s.isQueueOpen);
  return (
    <div className="mb-10 flex flex-shrink-0 items-center p-10">
      <IconButton
        iconSize="lg"
        className="mr-auto"
        onClick={() => playerOverlayState.toggle()}
      >
        <KeyboardArrowDownIcon />
      </IconButton>
      {isMobile && <LyricsButton />}
      {isMobile && <DownloadTrackButton />}
      <IconButton
        onClick={() => playerOverlayState.toggleQueue()}
        color={isQueueOpen ? 'primary' : undefined}
      >
        <MediaQueueListIcon />
      </IconButton>
      <FullscreenButton overlayRef={overlayRef} />
    </div>
  );
}

function Gradient() {
  const cuedTrack = useCuedTrack();
  if (!cuedTrack?.image) {
    return null;
  }
  return (
    <PlayerPageHeaderGradient
      bgColor="bg"
      image={cuedTrack.image}
      disableTransition
      height="h-[50vh]"
    />
  );
}
