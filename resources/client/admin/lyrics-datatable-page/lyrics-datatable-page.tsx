import {CreateLyricDialog} from '@app/admin/lyrics-datatable-page/create-lyric-dialog';
import {LyricDatatablePageFilters} from '@app/admin/lyrics-datatable-page/lyric-datatable-page-filters';
import {UpdateLyricDialog} from '@app/admin/lyrics-datatable-page/update-lyric-dialog';
import {appQueries} from '@app/app-queries';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {Lyric} from '@app/web-player/tracks/lyrics/lyric';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {GlobalLoadingProgress} from '@common/core/global-loading-progress';
import {ColumnConfig} from '@common/datatable/column-config';
import {DataTableAddItemButton} from '@common/datatable/data-table-add-item-button';
import {DataTableHeader} from '@common/datatable/data-table-header';
import {DataTablePaginationFooter} from '@common/datatable/data-table-pagination-footer';
import {useDatatableSearchParams} from '@common/datatable/filters/utils/use-datatable-search-params';
import {validateDatatableSearch} from '@common/datatable/filters/utils/validate-datatable-search';
import {DataTableEmptyStateMessage} from '@common/datatable/page/data-table-emty-state-message';
import {DatatableFilters} from '@common/datatable/page/datatable-filters';
import {
  DatatablePageHeaderBar,
  DatatablePageScrollContainer,
  DatatablePageWithHeaderBody,
  DatatablePageWithHeaderLayout,
} from '@common/datatable/page/datatable-page-with-header-layout';
import {useDatatableQuery} from '@common/datatable/requests/use-datatable-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Table} from '@common/ui/tables/table';
import {useMutation} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {EditIcon} from '@ui/icons/material/Edit';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {toast} from '@ui/toast/toast';
import {Fragment, useState} from 'react';
import lyricImage from './source-code.svg';

const columnConfig: ColumnConfig<Lyric>[] = [
  {
    key: 'track_id',
    allowsSorting: true,
    header: () => <Trans message="Track" />,
    width: 'flex-3 min-w-200',
    visibleInMode: 'all',
    body: lyric =>
      lyric.track ? (
        <div className="flex items-center gap-12">
          <TrackImage
            track={lyric.track}
            className="flex-shrink-0 rounded"
            size="w-34 h-34"
          />
          <div>
            <TrackLink track={lyric.track} target="_blank" />
            <ArtistLinks
              className="text-muted"
              artists={lyric.track?.artists}
            />
          </div>
        </div>
      ) : null,
  },
  {
    key: 'album',
    width: 'flex-2',
    header: () => <Trans message="Album" />,
    body: lyric =>
      lyric.track?.album ? <AlbumLink album={lyric.track.album} /> : null,
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    width: 'w-100',
    header: () => <Trans message="Last updated" />,
    body: lyric => <FormattedDate date={lyric.updated_at} />,
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    visibleInMode: 'all',
    width: 'w-42 flex-shrink-0',
    body: lyric => {
      return (
        <DialogTrigger type="modal">
          <IconButton size="md" className="text-muted">
            <EditIcon />
          </IconButton>
          <UpdateLyricDialog lyric={lyric} />
        </DialogTrigger>
      );
    },
  },
];

export function Component() {
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const {
    searchParams,
    sortDescriptor,
    mergeIntoSearchParams,
    setSearchQuery,
    isFiltering,
  } = useDatatableSearchParams(validateDatatableSearch);

  const query = useDatatableQuery(
    appQueries.lyrics.index({
      ...searchParams,
      with: 'track.album.artists',
    }),
  );

  const selectedActions = (
    <DialogTrigger type="modal">
      <Button variant="flat" color="danger">
        <Trans message="Delete" />
      </Button>
      <DeleteLyricsDialog
        selectedIds={selectedIds}
        onDelete={() => setSelectedIds([])}
      />
    </DialogTrigger>
  );

  return (
    <DatatablePageWithHeaderLayout>
      <GlobalLoadingProgress query={query} />
      <StaticPageTitle>
        <Trans message="Lyrics" />
      </StaticPageTitle>
      <DatatablePageHeaderBar
        title={<Trans message="Lyrics" />}
        showSidebarToggleButton
      />
      <DatatablePageWithHeaderBody>
        <DataTableHeader
          searchValue={searchParams.query}
          onSearchChange={setSearchQuery}
          actions={<Actions />}
          selectedItems={selectedIds}
          selectedActions={selectedActions}
          filters={LyricDatatablePageFilters}
        />
        <DatatableFilters filters={LyricDatatablePageFilters} />
        <DatatablePageScrollContainer>
          <Table
            columns={columnConfig}
            data={query.items}
            sortDescriptor={sortDescriptor}
            onSortChange={mergeIntoSearchParams}
            enableSelection
            selectedRows={selectedIds}
            onSelectionChange={setSelectedIds}
            cellHeight="h-54"
          />
          {query.isEmpty && (
            <DataTableEmptyStateMessage
              isFiltering={isFiltering}
              image={lyricImage}
              title={<Trans message="No lyrics have been created yet" />}
              filteringTitle={<Trans message="No matching lyrics" />}
            />
          )}
          <DataTablePaginationFooter
            query={query}
            onPageChange={page => mergeIntoSearchParams({page})}
            onPerPageChange={perPage => mergeIntoSearchParams({perPage})}
          />
        </DatatablePageScrollContainer>
      </DatatablePageWithHeaderBody>
    </DatatablePageWithHeaderLayout>
  );
}

function Actions() {
  return (
    <Fragment>
      <DialogTrigger type="modal">
        <DataTableAddItemButton>
          <Trans message="Add new lyric" />
        </DataTableAddItemButton>
        <CreateLyricDialog />
      </DialogTrigger>
    </Fragment>
  );
}

interface DeleteLyricsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteLyricsDialog({selectedIds, onDelete}: DeleteLyricsDialogProps) {
  const {close} = useDialogContext();
  const deleteSelectedLyrics = useMutation({
    mutationFn: () => apiClient.delete(`lyrics/${selectedIds.join(',')}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: appQueries.lyrics.invalidateKey,
      });
      toast(message('Lyrics deleted'));
      onDelete();
      close();
    },
    onError: err => showHttpErrorToast(err),
  });
  return (
    <ConfirmationDialog
      isDanger
      isLoading={deleteSelectedLyrics.isPending}
      title={<Trans message="Delete lyrics" />}
      body={
        <Trans
          message="Are you sure you want to delete selected lyrics?"
          values={{count: selectedIds.length}}
        />
      }
      confirm={<Trans message="Delete" />}
      onConfirm={() => deleteSelectedLyrics.mutate()}
    />
  );
}
