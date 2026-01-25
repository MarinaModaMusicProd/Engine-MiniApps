import {appQueries} from '@app/app-queries';
import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {OfflineEntityButtonLayout} from '@app/offline/offline-media-item-button';
import {offlineQueue} from '@app/offline/offline-queue';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {useCanOffline} from '@app/offline/use-can-offline';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {GenreLink} from '@app/web-player/genres/genre-link';
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
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {GetTrackResponse} from '@app/web-player/tracks/requests/get-track-response';
import {Track} from '@app/web-player/tracks/track';
import {TrackActionsBar} from '@app/web-player/tracks/track-actions-bar';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {trackIsLocallyUploaded} from '@app/web-player/tracks/utils/track-is-locally-uploaded';
import {CommentBarContextProvider} from '@app/web-player/tracks/waveform/comment-bar-context';
import {CommentBarNewCommentForm} from '@app/web-player/tracks/waveform/comment-bar-new-comment-form';
import {Waveform} from '@app/web-player/tracks/waveform/waveform';
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
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {Fragment, useEffect, useState} from 'react';
import {Link} from 'react-router';

export function Component() {
  return (
    <PlayerPageSuspense offlineFallback={<OfflineFallback />}>
      <TrackPage />
    </PlayerPageSuspense>
  );
}

function TrackPage() {
  const {trackId} = useRequiredParams(['trackId']);
  const query = useSuspenseQuery(appQueries.tracks.get(trackId, 'trackPage'));
  return <TrackPageLayout data={query.data} />;
}

interface AlbumTrackTableProps {
  album: FullAlbum;
  track: Track;
}
function AlbumTrackTable({album, track}: AlbumTrackTableProps) {
  const albumsTracks = album?.tracks?.length ? album.tracks : [track];
  const {data, sortDescriptor, onSortChange} =
    useSortableTableData(albumsTracks);
  return (
    <div className="mt-44">
      <div className="mb-14 flex items-center gap-16 overflow-hidden rounded bg-hover">
        <AlbumImage
          album={album}
          className="flex-shrink-0 rounded"
          size="w-70 h-70"
        />
        <div className="flex-auto">
          <div className="text-sm">
            <Trans message="From the album" />
          </div>
          <div className="text-sm font-semibold">
            <AlbumLink album={album} />
          </div>
        </div>
      </div>
      <TrackTable
        queueGroupId={queueGroupId(album)}
        tracks={data}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        hideTrackImage
        hideAlbum
        hidePopularity={false}
      />
    </div>
  );
}

interface TrackPageHeaderProps {
  track: GetTrackResponse['track'];
}
function TrackPageHeader({track}: TrackPageHeaderProps) {
  const isMobile = useIsMobileMediaQuery();
  const canOffline = useCanOffline();
  const {player} = useSettings();
  const releaseDate = track.album?.release_date || track.created_at;
  const genre = track.genres?.[0];

  const showWave =
    !isMobile &&
    player?.seekbar_type === 'waveform' &&
    trackIsLocallyUploaded(track);

  return (
    <Fragment>
      <MediaPageHeaderLayout
        image={<TrackImage track={track} className="rounded-panel" />}
        title={track.name}
        subtitle={
          <AvatarGroup>
            {track.artists?.map(artist => (
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
          <BulletSeparatedItems className="text-sm">
            {track.duration ? (
              <FormattedDuration ms={track.duration} verbose />
            ) : null}
            {releaseDate && <FormattedDate date={releaseDate} />}
            {genre && <GenreLink genre={genre} />}
            {track.plays && !player?.enable_repost ? (
              <Trans
                message=":count plays"
                values={{count: <FormattedNumber value={track.plays} />}}
              />
            ) : null}
          </BulletSeparatedItems>
        }
        actionsBar={
          <TrackActionsBar
            item={track}
            managesItem={false}
            buttonGap={undefined}
            buttonSize="sm"
            buttonClassName={actionButtonClassName()}
          >
            <PlaybackToggleButton
              buttonType="text"
              track={track}
              tracks={
                track.album?.tracks?.length ? track.album.tracks : undefined
              }
              className={actionButtonClassName({isFirst: true})}
              queueId={queueGroupId(track.album || track)}
            />
            {canOffline ? <OfflineTrackButton track={track} /> : null}
          </TrackActionsBar>
        }
        footer={
          showWave ? (
            <Waveform track={track} className="max-md:hidden" />
          ) : undefined
        }
      />
    </Fragment>
  );
}

function TrackPageLayout({data}: {data: GetTrackResponse}) {
  const {canView: showComments, canCreate: allowCommenting} =
    useCommentPermissions();
  const {canEdit} = useTrackPermissions([data.track]);
  return (
    <>
      {data.track.image && (
        <PlayerPageHeaderGradient image={data.track.image} />
      )}
      <div className="relative">
        <CommentBarContextProvider>
          <PageMetaTags data={data} />
          <AdHost slot="general_top" className="mb-44" />
          <TrackPageHeader track={data.track} />
          {allowCommenting ? (
            <CommentBarNewCommentForm
              className="mb-16"
              commentable={data.track}
            />
          ) : null}
        </CommentBarContextProvider>
        {data.track.tags?.length ? (
          <FocusScope>
            <ChipList className="mb-16" color="bg-fg-base/8" selectable>
              {data.track.tags.map(tag => (
                <Chip elementType={Link} to={`/tag/${tag.name}`} key={tag.id}>
                  #{tag.display_name || tag.name}
                </Chip>
              ))}
            </ChipList>
          </FocusScope>
        ) : null}
        <TruncatedDescription
          description={data.track.description}
          className="mt-24 text-sm"
        />
        {showComments ? (
          <CommentList
            className="mt-34"
            commentable={data.track}
            canDeleteAllComments={canEdit}
          />
        ) : null}
        {data.track.album && (
          <AlbumTrackTable album={data.track.album} track={data.track} />
        )}
        <AdHost slot="general_bottom" className="mt-44" />
      </div>
    </>
  );
}

type OfflineTrackButtonProps = {
  track: Track;
};
function OfflineTrackButton({track}: OfflineTrackButtonProps) {
  const [progress, setProgress] = useState<number>(0);
  const isOfflined = useOfflineEntitiesStore(s =>
    s.offlinedTrackIds.has(track.id),
  );

  useEffect(() => {
    if (isOfflined) {
      const handler = () => {
        const progress = offlineQueue
          .getDownloadProgress()
          .entries()
          .find(([id]) => id === track.id);
        setProgress(progress?.[1] ?? 0);
      };

      // get initial progress
      handler();

      return offlineQueue.listen('onActiveDownloadsChanged', handler);
    }
  }, [isOfflined]);

  return (
    <OfflineEntityButtonLayout
      isOfflined={isOfflined}
      className="mr-8"
      progress={progress}
      onClick={() => {
        if (isOfflined) {
          offlinedEntitiesStore().deleteOfflinedTracks([track]);
        } else {
          offlinedEntitiesStore().offlineTracks([track]);
        }
      }}
    />
  );
}

function OfflineFallback() {
  const [data, setData] = useState<GetTrackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {trackId} = useRequiredParams(['trackId']);
  useEffect(() => {
    getOfflinedTrackData(+trackId)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [trackId]);

  if (data) {
    return <TrackPageLayout data={data} />;
  }

  return isLoading ? null : <PlayerPageErrorMessage />;
}

async function getOfflinedTrackData(
  trackId: number,
): Promise<GetTrackResponse | null> {
  if (!offlinedEntitiesStore().offlinedTrackIds.has(trackId)) {
    return null;
  }

  const item = await offlinedTracks.get(trackId);
  const track = item?.data as GetTrackResponse['track'];
  if (!track) {
    return null;
  }

  return {
    loader: 'trackPage',
    track,
  };
}
