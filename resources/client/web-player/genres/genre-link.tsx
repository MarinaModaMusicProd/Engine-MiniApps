import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {slugifyString} from '@ui/utils/string/slugify-string';
import clsx from 'clsx';
import {useMemo} from 'react';
import {Link, LinkProps} from 'react-router';

interface GenreLinkProps extends Omit<LinkProps, 'to'> {
  genre: {name: string; display_name: string | null};
  className?: string;
}
export function GenreLink({genre, className, ...linkProps}: GenreLinkProps) {
  const uri = useMemo(() => {
    return getGenreLink(genre);
  }, [genre]);

  return (
    <Link
      {...linkProps}
      className={clsx(
        'block outline-none first-letter:capitalize hover:underline focus-visible:underline',
        className,
      )}
      to={uri}
    >
      {genre.display_name || genre.name}
    </Link>
  );
}

export function getGenreLink(
  genre: {name: string},
  {absolute}: {absolute?: boolean} = {},
) {
  const genreName = slugifyString(genre.name);
  let link = `/genre/${genreName}`;
  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
