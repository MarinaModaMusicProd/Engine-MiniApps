import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {MusicNoteIcon} from '@ui/icons/material/MusicNote';
import clsx from 'clsx';

interface TrackImageProps {
  track: {
    image?: string | null;
    name: string;
  };
  className?: string;
  size?: string;
  background?: string;
}
export function TrackImage({
  track,
  className,
  size,
  background = 'bg-fg-base/4',
}: TrackImageProps) {
  const {trans} = useTrans();
  const imgClassName = clsx(
    className,
    size,
    background,
    'object-cover',
    !track.image ? 'flex items-center justify-center' : 'block',
  );
  return track.image ? (
    <img
      className={imgClassName}
      draggable={false}
      loading="lazy"
      src={track.image}
      alt={trans(message('Image for :name', {values: {name: track.name}}))}
    />
  ) : (
    <span className={clsx(imgClassName, 'overflow-hidden')}>
      <MusicNoteIcon className="max-w-[60%] text-divider" size="text-9xl" />
    </span>
  );
}
