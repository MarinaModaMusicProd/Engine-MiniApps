import {LikeIconButton} from '@app/web-player/library/like-icon-button';
import {RemoveFromPlaylistMenuItem} from '@app/web-player/playlists/playlist-page/playlist-track-context-dialog';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {Track} from '@app/web-player/tracks/track';
import {TableContext} from '@common/ui/tables/table-context';
import {IconButton} from '@ui/buttons/icon-button';
import {MoreHorizIcon} from '@ui/icons/material/MoreHoriz';
import {MoreVertIcon} from '@ui/icons/material/MoreVert';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import clsx from 'clsx';
import {Fragment, useContext} from 'react';

interface Props {
  track: Track;
  isHovered: boolean;
}
export function TrackOptionsColumn({track, isHovered}: Props) {
  const isMobile = useIsMobileMediaQuery();
  const {meta} = useContext(TableContext);
  return (
    <Fragment>
      <DialogTrigger type="popover" mobileType="tray">
        <IconButton
          size={isMobile ? 'sm' : 'md'}
          className={clsx(
            isMobile ? 'text-muted' : 'mr-8',
            !isMobile && !isHovered && 'invisible',
          )}
        >
          {isMobile ? <MoreVertIcon /> : <MoreHorizIcon />}
        </IconButton>
        <TrackContextDialog tracks={[track]}>
          {tracks =>
            meta.playlist ? (
              <RemoveFromPlaylistMenuItem
                playlist={meta.playlist}
                tracks={tracks}
              />
            ) : null
          }
        </TrackContextDialog>
      </DialogTrigger>
      {!isMobile && <LikeIconButton size="xs" likeable={track} />}
    </Fragment>
  );
}
