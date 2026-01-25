import {appQueries} from '@app/app-queries';
import {offlinedEntitiesStore} from '@app/offline/offline-entities-store';
import {OfflineMediaItemButton} from '@app/offline/offline-media-item-button';
import {offlinedMediaItems} from '@app/offline/offline-media-items';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {GetAlbumResponse} from '@app/web-player/albums/requests/get-album-response';
import {useAlbumPermissions} from '@app/web-player/albums/use-album-permissions';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {BulletSeparatedItems} from '@app/web-player/layout/bullet-separated-items';
import {
  actionButtonClassName,
  MediaPageHeaderLayout,
} from '@app/web-player/layout/media-page-header-layout';
import {PlayerPageErrorMessage} from '@app/web-player/layout/player-page-error-message';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {useCommentPermissions} from '@app/web-player/tracks/hooks/use-comment-permissions';
import {TrackActionsBar} from '@app/web-player/tracks/track-actions-bar';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {CommentBarContextProvider} from '@app/web-player/tracks/waveform/comment-bar-context';
import {CommentBarNewCommentForm} from '@app/web-player/tracks/waveform/comment-bar-new-comment-form';
import {AdHost} from '@common/admin/ads/ad-host';
import {CommentList} from '@common/comments/comment-list/comment-list';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {TruncatedDescription} from '@common/ui/other/truncated-description';
import {useSortableTableData} from '@common/ui/tables/use-sortable-table-data';
import {FocusScope} from '@react-aria/focus';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Avatar} from '@ui/avatar/avatar';
import {AvatarGroup} from '@ui/avatar/avatar-group';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {ChipList} from '@ui/forms/input-field/chip-field/chip-list';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {Trans} from '@ui/i18n/trans';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {Fragment, useEffect, useState} from 'react';
import {Link} from 'react-router';

export function Component() {
  return (
    <PlayerPageSuspense offlineFallback={<OfflineFallback />}>
      <AlbumPage />
    </PlayerPageSuspense>
  );
}

function AlbumPage() {
  const {albumId} = useRequiredParams(['albumId']);
  const query = useSuspenseQuery(appQueries.albums.get(albumId, 'albumPage'));
  return <AlbumPageLayout data={query.data} />;
}

type AlbumPageLayoutProps = {
  data: GetAlbumResponse;
};
function AlbumPageLayout({data}: AlbumPageLayoutProps) {
  const {canEdit} = useAlbumPermissions(data.album);
  const {canView: showComments, canCreate: allowCommenting} =
    useCommentPermissions();
  return (
    <>
      <PageMetaTags data={data} />
      {data.album.image && (
        <PlayerPageHeaderGradient image={data.album.image} />
      )}
      <div className="relative">
        <CommentBarContextProvider>
          <AdHost slot="general_top" className="mb-44" />
          <AlbumPageHeader album={data.album} />
          {allowCommenting ? (
            <CommentBarNewCommentForm
              className="mb-16"
              commentable={data.album}
            />
          ) : null}
        </CommentBarContextProvider>
        {data.album.tags?.length ? (
          <FocusScope>
            <ChipList className="mb-16" selectable>
              {data.album.tags.map(tag => (
                <Chip elementType={Link} to={`/tag/${tag.name}`} key={tag.id}>
                  #{tag.display_name || tag.name}
                </Chip>
              ))}
            </ChipList>
          </FocusScope>
        ) : null}
        <TruncatedDescription
          description={data.album.description}
          className="mt-24 text-sm"
        />
        <AdHost slot="album_above" className="mt-34" />
        <AlbumTrackTable album={data.album} />
        {showComments && (
          <CommentList
            className="mt-34"
            commentable={data.album}
            canDeleteAllComments={canEdit}
          />
        )}
        <AdHost slot="general_bottom" className="mt-44" />
      </div>
    </>
  );
}

interface AlbumTrackTableProps {
  album: FullAlbum;
}
function AlbumTrackTable({album}: AlbumTrackTableProps) {
  const {data, sortDescriptor, onSortChange} = useSortableTableData(
    album.tracks,
  );
  return (
    <div className="mt-44">
      <TrackTable
        queueGroupId={queueGroupId(album)}
        tracks={data}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        hideTrackImage
        hideAlbum
        hidePopularity={false}
      />
      {!album.tracks?.length ? (
        <IllustratedMessage
          className="mt-34"
          title={<Trans message="Nothing to display" />}
          description={
            <Trans message="This album does not have any tracks yet" />
          }
        />
      ) : null}
    </div>
  );
}

interface PlaylistPageHeaderProps {
  album: FullAlbum;
}
function AlbumPageHeader({album}: PlaylistPageHeaderProps) {
  const totalDuration = album.tracks?.reduce(
    (t, track) => t + (track.duration || 0),
    0,
  );

  return (
    <Fragment>
      <MediaPageHeaderLayout
        centerItems
        image={<AlbumImage album={album} className="rounded-panel" />}
        title={album.name}
        subtitle={
          <AvatarGroup>
            {album.artists?.map(artist => (
              <Avatar
                key={artist.id}
                circle
                src={artist.image_small}
                label={artist.name}
                link={getArtistLink(artist)}
              />
            ))}
          </AvatarGroup>
        }
        description={
          <BulletSeparatedItems className="text-sm text-muted">
            {album.tracks?.length ? (
              <Trans
                message="[one 1 track|other :count tracks]"
                values={{count: album.tracks.length}}
              />
            ) : null}
            {album.tracks?.length ? (
              <FormattedDuration ms={totalDuration} verbose />
            ) : null}
            <FormattedDate date={album.release_date} />
          </BulletSeparatedItems>
        }
        actionsBar={
          <TrackActionsBar
            item={album}
            managesItem={false}
            buttonGap={undefined}
            buttonSize="sm"
            buttonClassName={actionButtonClassName()}
          >
            <PlaybackToggleButton
              disabled={!album.tracks?.length}
              buttonType="text"
              queueId={queueGroupId(album)}
              className={actionButtonClassName({isFirst: true})}
            />
            <OfflineMediaItemButton
              className="mr-8"
              item={album}
              totalTracksCount={album.tracks?.length ?? 0}
            />
          </TrackActionsBar>
        }
      />
    </Fragment>
  );
}

function OfflineFallback() {
  const [data, setData] = useState<GetAlbumResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {albumId} = useRequiredParams(['albumId']);
  useEffect(() => {
    getOfflinedAlbumData(+albumId)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [albumId]);

  if (data) {
    return <AlbumPageLayout data={data} />;
  }

  return isLoading ? null : <PlayerPageErrorMessage />;
}

async function getOfflinedAlbumData(
  albumId: number,
): Promise<GetAlbumResponse | null> {
  if (!offlinedEntitiesStore().offlinedAlbumIds.has(albumId)) {
    return null;
  }

  const item = await offlinedMediaItems.getAlbumById(albumId);
  const album = item?.data as FullAlbum;
  if (!album) {
    return null;
  }

  const tracks = await offlinedTracks.getTracksOfflinedBy(album);
  if (!tracks.length) {
    return null;
  }

  return {
    loader: 'albumPage',
    album: {
      ...album,
      tracks: tracks.map(track => track.data),
    },
  };
}
