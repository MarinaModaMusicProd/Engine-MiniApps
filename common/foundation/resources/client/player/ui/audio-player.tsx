import {MediaItem} from '@common/player/media-item';
import {PlayerContext} from '@common/player/player-context';
import {PlayerStoreOptions} from '@common/player/state/player-store-options';
import {FormattedCurrentTime} from '@common/player/ui/controls/formatted-current-time';
import {FormattedPlayerDuration} from '@common/player/ui/controls/formatted-player-duration';
import {PlayButton} from '@common/player/ui/controls/play-button';
import {PlaybackOptionsButton} from '@common/player/ui/controls/playback-options-button';
import {SeekButton} from '@common/player/ui/controls/seeking/seek-button';
import {Seekbar} from '@common/player/ui/controls/seeking/seekbar';
import {VolumeControls} from '@common/player/ui/controls/volume-controls';
import {PlayerOutlet} from '@common/player/ui/player-outlet';
import {guessPlayerProvider} from '@common/player/utils/guess-player-provider';
import {Forward10Icon} from '@ui/icons/material/Forward10';
import {UndoIcon} from '@ui/icons/material/Undo';
import clsx from 'clsx';
import {Fragment} from 'react';

interface Props {
  id: string;
  queue?: MediaItem[];
  cuedMediaId?: string;
  autoPlay?: boolean;
  listeners?: PlayerStoreOptions['listeners'];
  src?: string;
  className?: string;
}
export function AudioPlayer({
  id,
  queue,
  cuedMediaId,
  autoPlay,
  src,
  className,
}: Props) {
  return (
    <PlayerContext
      id={id}
      options={{
        autoPlay,
        initialData: {
          queue: queue ? queue : [mediaItemFromSrc(src!)],
          cuedMediaId,
        },
      }}
    >
      <div className={clsx(className, 'rounded shadow')}>
        <Player />
      </div>
    </PlayerContext>
  );
}

function Player() {
  return (
    <Fragment>
      <PlayerOutlet className="h-full w-full" />
      <Controls />
    </Fragment>
  );
}

function Controls() {
  return (
    <div className="flex items-center gap-24 p-14 text-sm">
      <div className="flex items-center gap-4">
        <SeekButton seconds="-15">
          <UndoIcon />
        </SeekButton>
        <PlayButton />
        <SeekButton seconds="+15">
          <Forward10Icon />
        </SeekButton>
      </div>
      <FormattedCurrentTime className="min-w-40 text-right" />
      <Seekbar fillColor="bg-black" trackColor="bg-black/20" />
      <FormattedPlayerDuration className="min-w-40 text-right" />
      <div className="flex items-center gap-4">
        <PlaybackOptionsButton />
        <VolumeControls fillColor="bg-black" trackColor="bg-black/20" />
      </div>
    </div>
  );
}

function mediaItemFromSrc(src: string): MediaItem {
  return {
    id: src,
    src,
    provider: guessPlayerProvider(src),
  };
}
