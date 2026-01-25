import {Genre} from '@app/web-player/genres/genre';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import clsx from 'clsx';
import {useMemo} from 'react';

const bgColors = [
  'rgb(0, 100, 80)',
  'rgb(220, 20, 140)',
  'rgb(132, 0, 231)',
  'rgb(30, 50, 100)',
  'rgb(71, 125, 149)',
  'rgb(225, 51, 0)',
  'rgb(71, 125, 149)',
  'rgb(13, 115, 236)',
  'rgb(0, 100, 80)',
  'rgb(80, 55, 80)',
  'rgb(175, 40, 150)',
  'rgb(71, 125, 149)',
  'rgb(233, 20, 41)',
  'rgb(141, 103, 171)',
  'rgb(71, 125, 149)',
  'rgb(225, 17, 140)',
  'rgb(119, 119, 119)',
  'rgb(141, 103, 171)',
  'rgb(216, 64, 0)',
  'rgb(186, 93, 7)',
  'rgb(225, 17, 140)',
];

interface GenreImageProps {
  genre: Genre;
  className?: string;
  size?: string;
}
export function GenreImage({genre, className, size}: GenreImageProps) {
  const {trans} = useTrans();
  const src = genre.image;
  const imgClassName = clsx(
    className,
    size,
    'object-cover bg-fg-base/4',
    !src ? 'flex items-center justify-center' : 'block',
  );

  const bgColor = useGenreBgColor(genre);

  return (
    <span
      className={clsx(
        imgClassName,
        'relative isolate flex items-center justify-center overflow-hidden rounded-panel bg-chip text-xl font-semibold capitalize',
      )}
    >
      {src ? (
        <img
          className="absolute inset-0 z-10 h-full w-full object-cover"
          draggable={false}
          loading="lazy"
          src={src}
          alt={trans(message('Image for :name', {values: {name: genre.name}}))}
        />
      ) : null}
      <span
        className="absolute inset-0 z-20 block h-full w-full"
        style={{
          backgroundColor: bgColor,
          opacity: genre.image ? 0.9 : 1,
        }}
      />
      <span className="relative z-30 block text-center text-white">
        {genre.display_name || genre.name}
      </span>
    </span>
  );
}

export function useGenreBgColor(genre: Genre) {
  const label = genre.display_name || genre.name;
  return useMemo(() => {
    const hash = (label || '')
      .split('')
      .reduce((accum, val) => val.charCodeAt(0) + accum, label?.length || 0);
    return bgColors[hash % bgColors.length];
  }, [label]);
}
