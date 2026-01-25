import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {slugifyString} from '@ui/utils/string/slugify-string';
import clsx from 'clsx';
import {useMemo} from 'react';
import {Link, LinkProps} from 'react-router';

interface AlbumLinkProps extends Omit<LinkProps, 'to'> {
  artist: {id: number; name: string};
  className?: string;
}
export function ArtistLink({artist, className, ...linkProps}: AlbumLinkProps) {
  const finalUri = useMemo(() => {
    return getArtistLink(artist);
  }, [artist]);

  return (
    <Link
      {...linkProps}
      className={clsx(
        'overflow-x-hidden overflow-ellipsis outline-none hover:underline focus-visible:underline',
        className,
      )}
      to={finalUri}
    >
      {artist.name}
    </Link>
  );
}

export function getArtistLink(
  artist: {id: number | string; name: string},
  {absolute}: {absolute?: boolean} = {},
): string {
  let link = `/artist/${artist.id}/${slugifyString(artist.name)}`;
  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
