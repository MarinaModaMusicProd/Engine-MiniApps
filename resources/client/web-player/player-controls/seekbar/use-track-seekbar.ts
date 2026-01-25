import {Track} from '@app/web-player/tracks/track';
import {
  tracksToMediaItems,
  trackToMediaItem,
} from '@app/web-player/tracks/utils/track-to-media-item';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';

export function useTrackSeekbar(track: Track, queue?: Track[]) {
  const player = usePlayerActions();
  const cuedMedia = usePlayerStore(s => s.cuedMedia);

  // either use exact duration from provider if this track is cued, or use duration from track props
  const playerDuration = usePlayerStore(s => s.mediaDuration);
  const duration =
    cuedMedia?.id === track.id && playerDuration
      ? playerDuration
      : (track.duration || 0) / 1000;

  const [currentTime, setCurrentTime] = useState(
    track.id === player.getState().cuedMedia?.id ? player.getCurrentTime() : 0,
  );

  useEffect(() => {
    return player.subscribe({
      progress: ({currentTime}) => {
        setCurrentTime(
          track.id === player.getState().cuedMedia?.id ? currentTime : 0,
        );
      },
    });
  }, [player, track]);

  return {
    duration,
    minValue: 0,
    maxValue: duration,
    value: currentTime,
    onPointerDown: () => {
      player.setIsSeeking(true);
      player.pause();

      // flush so provider src is changed immediately. Without this seeking
      // will not work when clicking on a different track the first time
      if (player.getState().cuedMedia?.id !== track.id) {
        flushSync(async () => {
          if (queue?.length) {
            const pointer = queue?.findIndex(t => t.id === track.id);
            player.overrideQueue(await tracksToMediaItems(queue), pointer);
          } else {
            player.cue(await trackToMediaItem(track));
          }
        });
      }
    },
    onChange: (value: number) => {
      player.getState().emit('progress', {currentTime: value});
      player.seek(value);
    },
    onChangeEnd: () => {
      player.setIsSeeking(false);
      player.play();
    },
  };
}
