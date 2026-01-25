import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {slugifyString} from '@ui/utils/string/slugify-string';
import clsx from 'clsx';
import {useMemo} from 'react';
import {Link} from 'react-router';

interface AlbumLinkProps {
  playlist: {id: number; name: string};
  className?: string;
}
export function PlaylistLink({playlist, className}: AlbumLinkProps) {
  const uri = useMemo(() => {
    return getPlaylistLink(playlist);
  }, [playlist.id]);

  return (
    <Link className={clsx('capitalize hover:underline', className)} to={uri}>
      {playlist.name}
    </Link>
  );
}

export function getPlaylistLink(
  playlist: {id: number; name: string},
  {absolute}: {absolute?: boolean} = {},
) {
  const playlistName = slugifyString(playlist.name);
  let link = `/playlist/${playlist.id}/${playlistName}`;
  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
