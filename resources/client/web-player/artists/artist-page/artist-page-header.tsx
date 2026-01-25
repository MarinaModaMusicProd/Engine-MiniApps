import {FullArtist} from '@app/web-player/artists/artist';
import {ArtistContextDialog} from '@app/web-player/artists/artist-context-dialog';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getGenreLink} from '@app/web-player/genres/genre-link';
import {
  actionButtonClassName,
  MediaPageHeaderLayout,
} from '@app/web-player/layout/media-page-header-layout';
import {LikeButton} from '@app/web-player/library/like-button';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {MediaItemStats} from '@app/web-player/tracks/media-item-stats';
import {ProfileDescription} from '@app/web-player/users/user-profile/profile-description';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {ArrowDropDownIcon} from '@ui/icons/material/ArrowDropDown';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useSettings} from '@ui/settings/use-settings';
import clsx from 'clsx';
import {Link} from 'react-router';

interface ArtistPageHeaderProps {
  artist: FullArtist;
}
export function ArtistPageHeader({artist}: ArtistPageHeaderProps) {
  const {artistPage} = useSettings();
  return (
    <div>
      <MediaPageHeaderLayout
        centerItems
        image={
          <SmallArtistImage
            showVerifiedBadge
            artist={artist}
            className="rounded-full object-cover"
          />
        }
        title={artist.name}
        subtitle={
          !!artist.genres?.length ? <GenreList genres={artist.genres} /> : null
        }
        actionsBar={
          <div className="flex flex-col items-center justify-center gap-24 md:flex-row md:justify-between">
            <ActionButtons artist={artist} />
            <MediaItemStats item={artist} />
          </div>
        }
        footer={
          artistPage.showDescription && (
            <ProfileDescription profile={artist.profile} links={artist.links} />
          )
        }
      />
    </div>
  );
}

interface GenreListProps {
  genres?: FullArtist['genres'];
}
function GenreList({genres}: GenreListProps) {
  return (
    <ul className="flex max-w-620 items-center justify-start gap-14 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-muted max-md:hidden">
      {genres?.slice(0, 5).map(genre => (
        <li key={genre.id}>
          <Link
            to={getGenreLink(genre)}
            className="block cursor-pointer rounded-button bg-fg-base/10 px-10 py-4 text-xs transition-colors hover:bg-fg-base/20"
          >
            {genre.display_name || genre.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

interface ActionButtonsProps {
  artist: FullArtist;
}
function ActionButtons({artist}: ActionButtonsProps) {
  return (
    <div>
      <PlaybackToggleButton
        queueId={queueGroupId(artist)}
        buttonType="text"
        className={actionButtonClassName({isFirst: true})}
      />
      <LikeButton
        likeable={artist}
        className={clsx(actionButtonClassName(), 'max-md:hidden')}
      />
      <DialogTrigger type="popover" mobileType="tray">
        <Button
          variant="outline"
          radius="rounded-full"
          endIcon={<ArrowDropDownIcon />}
          className={actionButtonClassName()}
        >
          <Trans message="More" />
        </Button>
        <ArtistContextDialog artist={artist} />
      </DialogTrigger>
    </div>
  );
}
