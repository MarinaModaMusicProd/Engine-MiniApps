import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumContextDialog} from '@app/web-player/albums/album-context-dialog';
import {LikeButton} from '@app/web-player/library/like-button';
import {RepostButton} from '@app/web-player/reposts/repost-button';
import {ShareMediaDialog} from '@app/web-player/sharing/share-media-dialog';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {MediaItemStats} from '@app/web-player/tracks/media-item-stats';
import {Track} from '@app/web-player/tracks/track';
import {Button} from '@ui/buttons/button';
import {ButtonSize} from '@ui/buttons/button-size';
import {Trans} from '@ui/i18n/trans';
import {MoreHorizIcon} from '@ui/icons/material/MoreHoriz';
import {ShareIcon} from '@ui/icons/material/Share';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {ReactNode} from 'react';

interface Props {
  item: Track | FullAlbum;
  managesItem: boolean;
  buttonClassName?: string;
  buttonGap?: string;
  buttonSize?: ButtonSize;
  children?: ReactNode;
  className?: string;
}
export function TrackActionsBar({
  item,
  managesItem,
  buttonClassName,
  buttonGap = 'mr-8',
  buttonSize = 'xs',
  children,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-24 overflow-hidden @container md:flex-row md:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-y-24">
        {children}
        <LikeButton
          size={buttonSize}
          likeable={item}
          className={clsx(buttonGap, buttonClassName, 'max-md:hidden')}
          disabled={managesItem}
        />
        <RepostButton
          item={item}
          size={buttonSize}
          disabled={managesItem}
          className={clsx(
            buttonGap,
            buttonClassName,
            'hidden @[840px]:inline-flex',
          )}
        />
        <DialogTrigger type="modal">
          <Button
            size={buttonSize}
            variant="outline"
            startIcon={<ShareIcon />}
            className={clsx(
              buttonGap,
              buttonClassName,
              'hidden @[660px]:inline-flex',
            )}
          >
            <Trans message="Share" />
          </Button>
          <ShareMediaDialog item={item} />
        </DialogTrigger>
        <DialogTrigger type="popover" mobileType="tray">
          <Button
            variant="outline"
            size={buttonSize}
            startIcon={<MoreHorizIcon />}
            className={clsx(buttonGap, buttonClassName)}
          >
            <Trans message="More" />
          </Button>
          <MoreDialog item={item} />
        </DialogTrigger>
      </div>
      <MediaItemStats item={item} />
    </div>
  );
}

interface MoreDialogProps {
  item: Track | FullAlbum;
}
function MoreDialog({item}: MoreDialogProps) {
  if (item.model_type === 'track') {
    return <TrackContextDialog tracks={[item]} />;
  }
  return <AlbumContextDialog album={item} />;
}
