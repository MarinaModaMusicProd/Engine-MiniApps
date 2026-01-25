import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {Genre} from '@app/web-player/genres/genre';
import {useGenreBgColor} from '@app/web-player/genres/genre-image';
import {getGenreLink} from '@app/web-player/genres/genre-link';
import clsx from 'clsx';
import {Link} from 'react-router';

interface GenreGridItemProps {
  genre: Genre;
  layout?: ContentGridItemLayout;
}
export function GenreGridItem({genre, layout}: GenreGridItemProps) {
  const bgColor = useGenreBgColor(genre);

  return (
    <Link
      to={getGenreLink(genre)}
      className={clsx(
        'relative isolate flex h-120 items-center justify-center overflow-hidden rounded-panel bg-chip p-12 text-xl font-semibold capitalize',
        layout === 'compact' ? 'h-88 my-10' : 'h-120',
      )}
    >
      {genre.image ? (
        <img
          src={genre.image}
          alt=""
          className="absolute inset-0 z-10 h-full w-full object-cover"
        />
      ) : null}
      <div
        className="absolute inset-0 z-20 h-full w-full"
        style={{
          backgroundColor: bgColor,
          opacity: genre.image ? 0.9 : 1,
        }}
      />
      <div className="relative z-30 text-center text-white">
        {genre.display_name || genre.name}
      </div>
    </Link>
  );
}
