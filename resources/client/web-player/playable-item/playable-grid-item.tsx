import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {PlayableModel} from '@app/web-player/playable-item/playable-model';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {IconButton, IconButtonProps} from '@ui/buttons/icon-button';
import {MoreHorizIcon} from '@ui/icons/material/MoreHoriz';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {cloneElement, ReactElement, ReactNode, useState} from 'react';

interface PlayableGridProps {
  image: ReactElement<{size: string; className?: string}>;
  title: ReactNode;
  subtitle?: ReactNode;
  model: PlayableModel;
  newQueue?: Track[];
  link: string;
  likeButton?: ReactElement<IconButtonProps>;
  contextDialog: ReactElement;
  radius?: string;
  layout?: ContentGridItemLayout;
}
export function PlayableGridItem(props: PlayableGridProps) {
  if (props.layout === 'compact') {
    return <CompactGridItem {...props} />;
  }
  return <DefaultGridItem {...props} />;
}

function DefaultGridItem({
  image,
  title,
  subtitle,
  model,
  newQueue,
  link,
  likeButton,
  contextDialog,
  radius = 'rounded-panel',
}: PlayableGridProps) {
  const navigate = useNavigate();
  return (
    <div className="snap-start snap-normal">
      <DialogTrigger
        type="popover"
        placement="bottom-start"
        mobileType="tray"
        triggerOnContextMenu
      >
        <div className="group relative isolate w-full">
          <div
            className="this aspect-square w-full"
            onClick={() => navigate(link)}
          >
            {cloneElement(image, {
              size: 'w-full h-full',
              className: `${radius} shadow-md z-10`,
            })}
          </div>
          <div
            key="bg-overlay"
            className={`absolute left-0 top-0 h-full w-full bg-gradient-to-b from-transparent to-black/75 ${radius} pointer-events-none z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          />
          <div
            className={clsx(
              'absolute bottom-0 left-0 z-30 flex w-full items-center gap-14 p-12',
              radius === 'rounded-full' &&
                'pointer-events-none right-0 top-0 justify-center',
            )}
          >
            <PlaybackToggleButton
              size={radius === 'rounded-full' ? 'lg' : 'md'}
              radius="rounded-full"
              className={clsx(
                'pointer-events-auto shadow-md',
                radius === 'rounded-full' && 'invisible group-hover:visible',
              )}
              variant="flat"
              color="white"
              buttonType="icon"
              track={model.model_type === TRACK_MODEL ? model : undefined}
              tracks={newQueue}
              queueId={queueGroupId(model)}
            />

            {radius !== 'rounded-full' && (
              <DialogTrigger type="popover" mobileType="tray">
                <IconButton
                  className="invisible md:group-hover:visible"
                  color="white"
                >
                  <MoreHorizIcon />
                </IconButton>
                {contextDialog}
              </DialogTrigger>
            )}
            {radius !== 'rounded-full' &&
              likeButton &&
              // 3 buttons won't fit if item is fully rounded
              cloneElement(likeButton, {
                className: 'invisible md:group-hover:visible ml-auto',
                size: 'md',
                color: 'white',
              })}
          </div>
        </div>
        {contextDialog}
      </DialogTrigger>
      <div
        className={clsx(
          radius === 'rounded-full' && 'text-center',
          'mt-12 text-sm',
        )}
      >
        <div className="line-clamp-2 overflow-ellipsis">{title}</div>
        <div className="mt-4 overflow-hidden overflow-ellipsis whitespace-nowrap text-muted">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function CompactGridItem({
  image,
  title,
  subtitle,
  model,
  newQueue,
  contextDialog,
}: PlayableGridProps) {
  const queueId = queueGroupId(model);
  const [isHover, setIsHover] = useState(false);
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const itemIsQueued = usePlayerStore(
    s => !!(s.cuedMedia && s.cuedMedia.groupId === queueId),
  );
  const itemIsPlaying = isPlaying && itemIsQueued;

  return (
    <div className="flex snap-start snap-normal items-center gap-16 border-t py-10">
      <div
        className={`group relative h-42 w-42 flex-shrink-0 cursor-pointer overflow-hidden rounded-md`}
        onPointerEnter={() => setIsHover(true)}
        onPointerLeave={() => setIsHover(false)}
      >
        {cloneElement(image, {
          size: 'w-full h-full',
          className: `shadow-md z-10`,
        })}
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0 top-0 bg-black/50',
            isHover || itemIsPlaying ? 'block' : 'hidden',
          )}
        >
          <PlaybackToggleButton
            buttonType="icon"
            track={model.model_type === TRACK_MODEL ? model : undefined}
            tracks={newQueue}
            queueId={queueId}
            color="white"
            equalizerColor="white"
            radius="rounded-none"
          />
        </div>
      </div>
      <div className="overflow-hidden overflow-ellipsis text-sm">
        <div className="whitespace-nowrap">{title}</div>
        <div className="whitespace-nowrap text-muted">{subtitle}</div>
      </div>
      <DialogTrigger type="popover" mobileType="tray">
        <IconButton size="sm" className="ml-auto">
          <MoreHorizIcon />
        </IconButton>
        {contextDialog}
      </DialogTrigger>
    </div>
  );
}
