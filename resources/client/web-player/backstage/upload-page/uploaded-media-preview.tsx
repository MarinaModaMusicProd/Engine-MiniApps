import {ALBUM_MODEL, FullAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {ShareMediaButtons} from '@app/web-player/sharing/share-media-buttons';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {LinkStyle} from '@ui/buttons/external-link';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {ChipList} from '@ui/forms/input-field/chip-field/chip-list';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';
import {Link} from 'react-router';
import albumBorderImage from './album-border.png';

interface UploadedMediaPreviewProps {
  media: Track | FullAlbum;
}
export function UploadedMediaPreview({media}: UploadedMediaPreviewProps) {
  const isAlbum = media.model_type === ALBUM_MODEL;
  const absoluteLink = isAlbum
    ? getAlbumLink(media, {absolute: true})
    : getTrackLink(media, {absolute: true});

  return (
    <div className="mx-auto my-20 flex w-780 max-w-full items-center gap-28 rounded-panel border bg-elevated p-20">
      <div className={clsx(isAlbum && 'relative isolate mx-18 my-14')}>
        {isAlbum ? (
          <AlbumImage
            album={media}
            className="relative z-20 flex-shrink-0 rounded"
            size="w-132 h-132"
          />
        ) : (
          <TrackImage
            track={media}
            className="relative z-20 flex-shrink-0 rounded"
            size="w-132 h-132"
          />
        )}
        {isAlbum && (
          <img
            className="absolute -left-14 -top-14 z-10 block h-160 w-160 max-w-160"
            src={albumBorderImage}
            alt=""
          />
        )}
      </div>
      <div className="flex-auto">
        <div className="text-base font-bold">{media.name}</div>
        <div className="mb-14 text-sm text-muted">
          <ArtistLinks artists={media.artists} />
        </div>
        {media.genres?.length ? (
          <ChipList selectable={false} size="sm" className="mb-14">
            {media.genres?.map(genre => {
              return (
                <Chip key={genre.id}>{genre.display_name || genre.name}</Chip>
              );
            })}
          </ChipList>
        ) : null}
        <div className="text-sm">
          <Trans
            message="Upload complete. <a>Go to your track</a>"
            values={{
              a: parts => (
                <Link
                  className={LinkStyle}
                  to={isAlbum ? getAlbumLink(media) : getTrackLink(media)}
                >
                  {parts}
                </Link>
              ),
            }}
          />
        </div>
      </div>
      <div className="max-w-300 ml-auto flex-auto">
        <div className="text-sm text-muted">
          <Trans message="Share your new track" />
          <ShareMediaButtons
            name={media.name}
            image={media.image}
            link={absoluteLink}
          />
          <TextField
            value={absoluteLink}
            readOnly
            className="mt-24 w-full"
            size="sm"
            onClick={e => {
              (e.target as HTMLInputElement).select();
            }}
          />
        </div>
      </div>
    </div>
  );
}
