import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {slugifyString} from '@ui/utils/string/slugify-string';
import clsx from 'clsx';
import {useMemo} from 'react';
import {Link, LinkProps} from 'react-router';

interface TrackLinkProps extends Omit<LinkProps, 'to'> {
  track: {id: number; name: string};
  className?: string;
}
export function TrackLink({track, className, ...linkProps}: TrackLinkProps) {
  const finalUri = useMemo(() => {
    return getTrackLink(track);
  }, [track]);

  return (
    <Link
      {...linkProps}
      className={clsx(
        'overflow-x-hidden overflow-ellipsis hover:underline',
        className,
      )}
      to={finalUri}
    >
      {track.name}
    </Link>
  );
}

export function getTrackLink(
  track: {id: number; name: string},
  {absolute}: {absolute?: boolean} = {},
): string {
  let link = `/track/${track.id}/${slugifyString(track.name)}`;
  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
