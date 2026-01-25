import {AlbumLink} from '@app/web-player/albums/album-link';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {TableTrackContextDialog} from '@app/web-player/tracks/context-dialog/table-track-context-dialog';
import {LibraryPageTrack, Track} from '@app/web-player/tracks/track';
import {TogglePlaybackColumn} from '@app/web-player/tracks/track-table/toggle-playback-column';
import {
  TrackNameColumn,
  TrackNameColumnPlaceholder,
} from '@app/web-player/tracks/track-table/track-name-column';
import {TrackOptionsColumn} from '@app/web-player/tracks/track-table/track-options-column';
import {TrackTableMeta} from '@app/web-player/tracks/track-table/use-track-table-meta';
import {tracksToMediaItems} from '@app/web-player/tracks/utils/track-to-media-item';
import {ColumnConfig} from '@common/datatable/column-config';
import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {Table, TableProps} from '@common/ui/tables/table';
import {RowElementProps} from '@common/ui/tables/table-row';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {Trans} from '@ui/i18n/trans';
import {ScheduleIcon} from '@ui/icons/material/Schedule';
import {TrendingUpIcon} from '@ui/icons/material/TrendingUp';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Skeleton} from '@ui/skeleton/skeleton';
import {useIsMobileDevice} from '@ui/utils/hooks/is-mobile-device';
import {useMemo} from 'react';

const columnConfig: ColumnConfig<Track | LibraryPageTrack>[] = [
  {
    key: 'index',
    header: () => <span>#</span>,
    align: 'center',
    width: 'w-24 flex-shrink-0',
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton size="w-20 h-20" variant="rect" />;
      }
      return (
        <TogglePlaybackColumn
          track={track}
          rowIndex={row.index}
          isHovered={row.isHovered}
        />
      );
    },
  },
  {
    key: 'name',
    allowsSorting: true,
    width: 'flex-3 min-w-224',
    visibleInMode: 'all',
    header: () => <Trans message="Title" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <TrackNameColumnPlaceholder />;
      }
      return <TrackNameColumn track={track} />;
    },
  },
  {
    key: 'album_id',
    allowsSorting: true,
    width: 'flex-2',
    header: () => <Trans message="Album" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="max-w-4/5 leading-3" />;
      }
      return track.album ? <AlbumLink album={track.album} /> : null;
    },
  },
  {
    key: 'added_at',
    sortingKey: 'likes.created_at',
    allowsSorting: true,
    maxWidth: 'max-w-112',
    header: () => <Trans message="Date added" />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="max-w-4/5 leading-3" />;
      }
      return (
        <FormattedRelativeTime date={(track as LibraryPageTrack).added_at} />
      );
    },
  },
  {
    key: 'options',
    align: 'end',
    width: 'w-36 md:w-84',
    header: () => <Trans message="Options" />,
    hideHeader: true,
    visibleInMode: 'all',
    body: (track, row) => {
      if (row.isPlaceholder) {
        return (
          <div className="flex justify-end">
            <Skeleton size="w-20 h-20" variant="rect" />
          </div>
        );
      }
      return <TrackOptionsColumn track={track} isHovered={row.isHovered} />;
    },
  },
  {
    key: 'duration',
    allowsSorting: true,
    className: 'text-muted',
    maxWidth: 'max-w-48',
    align: 'end',
    header: () => <ScheduleIcon />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="leading-3" />;
      }
      return track.duration ? <FormattedDuration ms={track.duration} /> : null;
    },
  },
  {
    key: 'popularity',
    allowsSorting: true,
    className: 'text-muted',
    maxWidth: 'max-w-54',
    header: () => <TrendingUpIcon />,
    body: (track, row) => {
      if (row.isPlaceholder) {
        return <Skeleton className="leading-3" />;
      }
      return (
        <div className="relative h-6 w-54 rounded-button bg-chip">
          <div
            style={{width: `${track.popularity || 50}%`}}
            className="absolute left-0 top-0 h-6 w-0 rounded-button bg-black/30 dark:bg-white/30"
          />
        </div>
      );
    },
  },
];

export interface TrackTableProps {
  tracks: Track[] | TableDataItem[]; // might be passing in placeholder items for skeletons
  hideAlbum?: boolean;
  hideTrackImage?: boolean;
  hidePopularity?: boolean;
  hideAddedAtColumn?: boolean;
  hideHeaderRow?: boolean;
  queueGroupId?: string | number;
  playlist?: PartialPlaylist;
  renderRowAs?: TableProps<Track>['renderRowAs'];
  sortDescriptor?: TableProps<Track>['sortDescriptor'];
  onSortChange?: TableProps<Track>['onSortChange'];
  enableSorting?: TableProps<Track>['enableSorting'];
  tableBody?: TableProps<Track>['tableBody'];
  className?: string;
}
export function TrackTable({
  tracks,
  hideAlbum = false,
  hideHeaderRow = false,
  hideTrackImage = false,
  hidePopularity = true,
  hideAddedAtColumn = true,
  queueGroupId,
  renderRowAs,
  playlist,
  ...tableProps
}: TrackTableProps) {
  const player = usePlayerActions();
  const isMobile = useIsMobileDevice();
  hideHeaderRow = hideHeaderRow || isMobile;

  const filteredColumns = useMemo(() => {
    return columnConfig.filter(col => {
      if (col.key === 'album_id' && hideAlbum) {
        return false;
      }
      if (col.key === 'popularity' && hidePopularity) {
        return false;
      }
      if (col.key === 'added_at' && hideAddedAtColumn) {
        return false;
      }
      return true;
    });
  }, [hideAlbum, hidePopularity, hideAddedAtColumn]);

  const meta: TrackTableMeta = useMemo(() => {
    return {queueGroupId: queueGroupId, hideTrackImage, playlist};
  }, [queueGroupId, hideTrackImage, playlist]);

  return (
    <Table
      closeOnInteractOutside
      hideHeaderRow={hideHeaderRow}
      selectionStyle="highlight"
      selectRowOnContextMenu
      renderRowAs={renderRowAs || TrackTableRowWithContextMenu}
      columns={filteredColumns}
      data={tracks as Track[]}
      meta={meta}
      hideBorder={true}
      hideHeaderBorder={hideHeaderRow}
      cellHeight="h-56"
      onAction={async (track, index) => {
        const newQueue = await tracksToMediaItems(
          tracks as Track[],
          queueGroupId as string,
        );
        player.overrideQueueAndPlay(newQueue, index);
      }}
      {...tableProps}
    />
  );
}

function TrackTableRowWithContextMenu({
  item,
  children,
  ...domProps
}: RowElementProps<Track>) {
  const row = <div {...domProps}>{children}</div>;
  if (item.isPlaceholder) {
    return row;
  }
  return (
    <DialogTrigger
      type="popover"
      mobileType="tray"
      triggerOnContextMenu
      placement="bottom-start"
    >
      {row}
      <TableTrackContextDialog />
    </DialogTrigger>
  );
}
