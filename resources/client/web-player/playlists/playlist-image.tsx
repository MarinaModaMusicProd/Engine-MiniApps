import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {PlaylistPlayIcon} from '@ui/icons/material/PlaylistPlay';
import clsx from 'clsx';

interface PlaylistImageProps {
  playlist: PartialPlaylist;
  className?: string;
  size?: string;
}
export function PlaylistImage({playlist, className, size}: PlaylistImageProps) {
  const {trans} = useTrans();
  const src = playlist.image;
  const imgClassName = clsx(
    className,
    size,
    'object-cover bg-fg-base/4',
    !src ? 'flex items-center justify-center' : 'block',
  );

  return src ? (
    <img
      className={clsx(imgClassName, size, 'bg-fg-base/4 object-cover')}
      draggable={false}
      loading="lazy"
      src={src}
      alt={trans(message('Image for :name', {values: {name: playlist.name}}))}
    />
  ) : (
    <span className={clsx(imgClassName, 'overflow-hidden')}>
      <PlaylistPlayIcon className="max-w-[60%] text-divider" size="text-9xl" />
    </span>
  );
}
