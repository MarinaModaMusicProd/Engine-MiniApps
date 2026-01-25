import {ImportTrackDialog} from '@app/admin/tracks-datatable-page/import-track-dialog';
import {TracksDatatableColumns} from '@app/admin/tracks-datatable-page/tracks-datatable-columns';
import {TracksDatatableFilters} from '@app/admin/tracks-datatable-page/tracks-datatable-filters';
import {appQueries} from '@app/app-queries';
import {GlobalLoadingProgress} from '@common/core/global-loading-progress';
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
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Table} from '@common/ui/tables/table';
import {useMutation} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {PublishIcon} from '@ui/icons/material/Publish';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useSettings} from '@ui/settings/use-settings';
import {toast} from '@ui/toast/toast';
import {Tooltip} from '@ui/tooltip/tooltip';
import {Fragment, useState} from 'react';
import {Link} from 'react-router';
import marketing from './music.svg';

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
    appQueries.tracks.index({
      ...searchParams,
      with: 'artists,lyric',
    }),
  );

  const selectedActions = (
    <DialogTrigger type="modal">
      <Button variant="flat" color="danger">
        <Trans message="Delete" />
      </Button>
      <DeleteTracksDialog
        selectedIds={selectedIds}
        onDelete={() => setSelectedIds([])}
      />
    </DialogTrigger>
  );

  return (
    <DatatablePageWithHeaderLayout>
      <GlobalLoadingProgress query={query} />
      <StaticPageTitle>
        <Trans message="Tracks" />
      </StaticPageTitle>
      <DatatablePageHeaderBar
        title={<Trans message="Tracks" />}
        showSidebarToggleButton
      />
      <DatatablePageWithHeaderBody>
        <DataTableHeader
          searchValue={searchParams.query}
          onSearchChange={setSearchQuery}
          actions={<Actions />}
          selectedItems={selectedIds}
          selectedActions={selectedActions}
          filters={TracksDatatableFilters}
        />
        <DatatableFilters filters={TracksDatatableFilters} />
        <DatatablePageScrollContainer>
          <Table
            columns={TracksDatatableColumns}
            data={query.items}
            sortDescriptor={sortDescriptor}
            onSortChange={mergeIntoSearchParams}
            enableSelection
            selectedRows={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          {query.isEmpty && (
            <DataTableEmptyStateMessage
              isFiltering={isFiltering}
              image={marketing}
              title={<Trans message="No tracks have been created yet" />}
              filteringTitle={<Trans message="No matching tracks" />}
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
  const {spotify_is_setup} = useSettings();
  const navigate = useNavigate();
  return (
    <Fragment>
      {spotify_is_setup && (
        <DialogTrigger
          type="modal"
          onClose={track => {
            if (track) {
              navigate(`/admin/tracks/${track.id}/edit`);
            }
          }}
        >
          <Tooltip label={<Trans message="Import by spotify ID" />}>
            <IconButton
              variant="outline"
              color="primary"
              className="flex-shrink-0"
              size="sm"
            >
              <PublishIcon />
            </IconButton>
          </Tooltip>
          <ImportTrackDialog />
        </DialogTrigger>
      )}
      <DataTableAddItemButton elementType={Link} to="new">
        <Trans message="Add new track" />
      </DataTableAddItemButton>
    </Fragment>
  );
}

interface DeleteTracksDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteTracksDialog({selectedIds, onDelete}: DeleteTracksDialogProps) {
  const {close} = useDialogContext();
  const deleteSelectedTracks = useMutation({
    mutationFn: () => apiClient.delete(`tracks/${selectedIds.join(',')}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: appQueries.tracks.invalidateKey,
      });
      toast(message('Tracks deleted'));
      onDelete();
      close();
    },
    onError: err => showHttpErrorToast(err),
  });
  return (
    <ConfirmationDialog
      isDanger
      isLoading={deleteSelectedTracks.isPending}
      title={<Trans message="Delete tracks" />}
      body={
        <Trans
          message="Are you sure you want to delete selected tracks?"
          values={{count: selectedIds.length}}
        />
      }
      confirm={<Trans message="Delete" />}
      onConfirm={() => deleteSelectedTracks.mutate()}
    />
  );
}
