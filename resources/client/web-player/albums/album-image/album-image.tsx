import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {AlbumIcon} from '@ui/icons/material/Album';
import clsx from 'clsx';

interface AlbumImageProps {
  album: {image: string | null; name: string};
  className?: string;
  size?: string;
}
export function AlbumImage({album, className, size}: AlbumImageProps) {
  const {trans} = useTrans();
  const src = album?.image;
  const imgClassName = clsx(
    className,
    size,
    'object-cover bg-fg-base/4',
    !src ? 'flex items-center justify-center' : 'block',
  );

  return src ? (
    <img
      className={imgClassName}
      draggable={false}
      loading="lazy"
      src={src}
      alt={trans(message('Image for :name', {values: {name: album.name}}))}
    />
  ) : (
    <span className={clsx(imgClassName, 'overflow-hidden')}>
      <AlbumIcon className="max-w-[60%] text-divider" size="text-9xl" />
    </span>
  );
}
