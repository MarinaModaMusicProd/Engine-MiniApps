import {CreateGenreDialog} from '@app/admin/genres-datatable-page/create-genre-dialog';
import {GenreDatatablePageFilters} from '@app/admin/genres-datatable-page/genre-datatable-page-filters';
import {UpdateGenreDialog} from '@app/admin/genres-datatable-page/update-genre-dialog';
import {appQueries} from '@app/app-queries';
import {Genre} from '@app/web-player/genres/genre';
import {GenreLink} from '@app/web-player/genres/genre-link';
import {GlobalLoadingProgress} from '@common/core/global-loading-progress';
import {ColumnConfig} from '@common/datatable/column-config';
import {NameWithAvatar} from '@common/datatable/column-templates/name-with-avatar';
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
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {EditIcon} from '@ui/icons/material/Edit';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {toast} from '@ui/toast/toast';
import {Fragment, useState} from 'react';
import GenreImage from './../tracks-datatable-page/music.svg';

type TableGenre = Genre & {artists_count: number; updated_at: string};

const columnConfig: ColumnConfig<TableGenre>[] = [
  {
    key: 'name',
    allowsSorting: true,
    visibleInMode: 'all',
    width: 'flex-3 min-w-200',
    header: () => <Trans message="Genre" />,
    body: genre => (
      <NameWithAvatar image={genre.image} label={<GenreLink genre={genre} />} />
    ),
  },
  {
    key: 'display_name',
    allowsSorting: true,
    header: () => <Trans message="Display name" />,
    body: genre => genre.display_name || genre.name,
  },
  {
    key: 'artists_count',
    allowsSorting: true,
    header: () => <Trans message="Number of artists" />,
    body: genre =>
      genre.artists_count ? (
        <FormattedNumber value={genre.artists_count} />
      ) : null,
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    width: 'w-100',
    header: () => <Trans message="Last updated" />,
    body: genre => <FormattedDate date={genre.updated_at} />,
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    visibleInMode: 'all',
    width: 'w-42 flex-shrink-0',
    body: genre => {
      return (
        <DialogTrigger type="modal">
          <IconButton size="md" className="text-muted">
            <EditIcon />
          </IconButton>
          <UpdateGenreDialog genre={genre} />
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
    appQueries.genres.index({
      ...searchParams,
      withCount: 'artists',
    }),
  );

  const selectedActions = (
    <DialogTrigger type="modal">
      <Button variant="flat" color="danger">
        <Trans message="Delete" />
      </Button>
      <DeleteGenresDialog
        selectedIds={selectedIds}
        onDelete={() => setSelectedIds([])}
      />
    </DialogTrigger>
  );

  return (
    <DatatablePageWithHeaderLayout>
      <GlobalLoadingProgress query={query} />
      <StaticPageTitle>
        <Trans message="Genres" />
      </StaticPageTitle>
      <DatatablePageHeaderBar
        title={<Trans message="Genres" />}
        showSidebarToggleButton
      />
      <DatatablePageWithHeaderBody>
        <DataTableHeader
          searchValue={searchParams.query}
          onSearchChange={setSearchQuery}
          actions={<Actions />}
          selectedItems={selectedIds}
          selectedActions={selectedActions}
          filters={GenreDatatablePageFilters}
        />
        <DatatableFilters filters={GenreDatatablePageFilters} />
        <DatatablePageScrollContainer>
          <Table
            columns={columnConfig}
            data={query.items as TableGenre[]}
            sortDescriptor={sortDescriptor}
            onSortChange={mergeIntoSearchParams}
            enableSelection
            selectedRows={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          {query.isEmpty && (
            <DataTableEmptyStateMessage
              isFiltering={isFiltering}
              image={GenreImage}
              title={<Trans message="No genres have been created yet" />}
              filteringTitle={<Trans message="No matching genres" />}
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
          <Trans message="Add new genre" />
        </DataTableAddItemButton>
        <CreateGenreDialog />
      </DialogTrigger>
    </Fragment>
  );
}

interface DeleteGenresDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteGenresDialog({selectedIds, onDelete}: DeleteGenresDialogProps) {
  const {close} = useDialogContext();
  const deleteSelectedGenres = useMutation({
    mutationFn: () => apiClient.delete(`genres/${selectedIds.join(',')}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: appQueries.genres.invalidateKey,
      });
      toast(message('Genres deleted'));
      onDelete();
      close();
    },
    onError: err => showHttpErrorToast(err),
  });
  return (
    <ConfirmationDialog
      isDanger
      isLoading={deleteSelectedGenres.isPending}
      title={<Trans message="Delete genres" />}
      body={
        <Trans
          message="Are you sure you want to delete selected genres?"
          values={{count: selectedIds.length}}
        />
      }
      confirm={<Trans message="Delete" />}
      onConfirm={() => deleteSelectedGenres.mutate()}
    />
  );
}
