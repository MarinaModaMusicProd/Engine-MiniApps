import playlistImage from '@app/admin/channels/playlist.svg';
import {ImportPlaylistDialog} from '@app/admin/playlist-datatable-page/import-playlist-dialog';
import {PlaylistDatatablePageFilters} from '@app/admin/playlist-datatable-page/playlist-datatable-page-filters';
import {appQueries} from '@app/app-queries';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {UpdatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/update-playlist-dialog';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistLink} from '@app/web-player/playlists/playlist-link';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
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
import {CheckIcon} from '@ui/icons/material/Check';
import {EditIcon} from '@ui/icons/material/Edit';
import {PublishIcon} from '@ui/icons/material/Publish';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useSettings} from '@ui/settings/use-settings';
import {toast} from '@ui/toast/toast';
import {Tooltip} from '@ui/tooltip/tooltip';
import {Fragment, useState} from 'react';

const columnConfig: ColumnConfig<FullPlaylist>[] = [
  {
    key: 'name',
    allowsSorting: true,
    width: 'flex-3 min-w-200',
    visibleInMode: 'all',
    header: () => <Trans message="Playlist" />,
    body: playlist => (
      <NameWithAvatar
        image={playlist.image}
        label={<PlaylistLink playlist={playlist} />}
      />
    ),
  },
  {
    key: 'owner',
    header: () => <Trans message="Owner" />,
    width: 'flex-2',
    body: playlist =>
      playlist.owner ? (
        <NameWithAvatar
          image={playlist.owner?.image}
          label={<UserProfileLink user={playlist.owner} />}
          description={playlist.owner.email}
        />
      ) : null,
  },
  {
    key: 'public',
    allowsSorting: true,
    maxWidth: 'max-w-100',
    header: () => <Trans message="Public" />,
    body: entry => entry.public && <CheckIcon className="text-muted" />,
  },
  {
    key: 'collaborative',
    allowsSorting: true,
    maxWidth: 'max-w-100',
    header: () => <Trans message="Collaborative" />,
    body: entry => entry.collaborative && <CheckIcon className="text-muted" />,
  },
  {
    key: 'views',
    maxWidth: 'max-w-100',
    allowsSorting: true,
    header: () => <Trans message="Views" />,
    body: playlist =>
      playlist.views ? <FormattedNumber value={playlist.views} /> : null,
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    width: 'w-100',
    header: () => <Trans message="Last updated" />,
    body: playlist => <FormattedDate date={playlist.updated_at} />,
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    width: 'w-42 flex-shrink-0',
    visibleInMode: 'all',
    body: playlist => {
      return (
        <DialogTrigger
          type="modal"
          onClose={updatedPlaylist => {
            if (updatedPlaylist) {
              invalidateQuery();
            }
          }}
        >
          <IconButton size="md" className="text-muted">
            <EditIcon />
          </IconButton>
          <UpdatePlaylistDialog playlist={playlist} />
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
    appQueries.playlists.index({
      ...searchParams,
      with: 'owner',
    }),
  );

  const selectedActions = (
    <DialogTrigger type="modal">
      <Button variant="flat" color="danger">
        <Trans message="Delete" />
      </Button>
      <DeletePlaylistsDialog
        selectedIds={selectedIds}
        onDelete={() => setSelectedIds([])}
      />
    </DialogTrigger>
  );

  return (
    <DatatablePageWithHeaderLayout>
      <GlobalLoadingProgress query={query} />
      <StaticPageTitle>
        <Trans message="Playlists" />
      </StaticPageTitle>
      <DatatablePageHeaderBar
        title={<Trans message="Playlists" />}
        showSidebarToggleButton
      />
      <DatatablePageWithHeaderBody>
        <DataTableHeader
          searchValue={searchParams.query}
          onSearchChange={setSearchQuery}
          actions={<Actions />}
          selectedItems={selectedIds}
          selectedActions={selectedActions}
          filters={PlaylistDatatablePageFilters}
        />
        <DatatableFilters filters={PlaylistDatatablePageFilters} />
        <DatatablePageScrollContainer>
          <Table
            columns={columnConfig}
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
              image={playlistImage}
              title={<Trans message="No playlists have been created yet" />}
              filteringTitle={<Trans message="No matching playlists" />}
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
  return (
    <Fragment>
      {spotify_is_setup && (
        <DialogTrigger
          type="modal"
          onClose={newPlaylist => {
            if (newPlaylist) {
              invalidateQuery();
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
          <ImportPlaylistDialog />
        </DialogTrigger>
      )}
      <DialogTrigger
        type="modal"
        onClose={newPlaylist => {
          if (newPlaylist) {
            invalidateQuery();
          }
        }}
      >
        <DataTableAddItemButton>
          <Trans message="Add new playlist" />
        </DataTableAddItemButton>
        <CreatePlaylistDialog />
      </DialogTrigger>
    </Fragment>
  );
}

interface DeletePlaylistsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeletePlaylistsDialog({
  selectedIds,
  onDelete,
}: DeletePlaylistsDialogProps) {
  const {close} = useDialogContext();
  const deleteSelectedPlaylists = useMutation({
    mutationFn: () => apiClient.delete(`playlists/${selectedIds.join(',')}`),
    onSuccess: async () => {
      await invalidateQuery();
      toast(message('Playlists deleted'));
      onDelete();
      close();
    },
    onError: err => showHttpErrorToast(err),
  });
  return (
    <ConfirmationDialog
      isDanger
      isLoading={deleteSelectedPlaylists.isPending}
      title={<Trans message="Delete playlists" />}
      body={
        <Trans
          message="Are you sure you want to delete selected playlists?"
          values={{count: selectedIds.length}}
        />
      }
      confirm={<Trans message="Delete" />}
      onConfirm={() => deleteSelectedPlaylists.mutate()}
    />
  );
}

function invalidateQuery() {
  return queryClient.invalidateQueries({
    queryKey: appQueries.playlists.invalidateKey,
  });
}
