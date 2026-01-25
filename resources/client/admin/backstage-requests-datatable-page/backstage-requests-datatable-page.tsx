import {AdminDocsUrls} from '@app/admin/admin-config';
import {BackstageRequestDatatableFilters} from '@app/admin/backstage-requests-datatable-page/backstage-request-datatable-filters';
import {BackstageRequestsDatatableColumns} from '@app/admin/backstage-requests-datatable-page/backstage-requests-datatable-columns';
import {appQueries} from '@app/app-queries';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
import {GlobalLoadingProgress} from '@common/core/global-loading-progress';
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
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {toast} from '@ui/toast/toast';
import {useState} from 'react';
import acceptRequest from './accept-request.svg';

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
    appQueries.backstageRequests.index(searchParams),
  );

  const selectedActions = (
    <DialogTrigger type="modal">
      <Button variant="flat" color="danger">
        <Trans message="Delete" />
      </Button>
      <DeleteRequestsDialog
        selectedIds={selectedIds}
        onDelete={() => setSelectedIds([])}
      />
    </DialogTrigger>
  );

  return (
    <DatatablePageWithHeaderLayout>
      <GlobalLoadingProgress query={query} />
      <StaticPageTitle>
        <Trans message="Backstage requests" />
      </StaticPageTitle>
      <DatatablePageHeaderBar
        title={<Trans message="Backstage requests" />}
        showSidebarToggleButton
        rightContent={
          <DocsLink
            variant="button"
            link={AdminDocsUrls.pages.backstage}
            size="xs"
          />
        }
      />
      <DatatablePageWithHeaderBody>
        <DataTableHeader
          searchValue={searchParams.query}
          onSearchChange={setSearchQuery}
          selectedItems={selectedIds}
          selectedActions={selectedActions}
          filters={BackstageRequestDatatableFilters}
        />
        <DatatableFilters filters={BackstageRequestDatatableFilters} />
        <DatatablePageScrollContainer>
          <Table
            columns={BackstageRequestsDatatableColumns}
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
              image={acceptRequest}
              title={<Trans message="No requests have been created yet" />}
              filteringTitle={<Trans message="No matching requests" />}
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

interface DeleteRequestsDialogProps {
  selectedIds: (number | string)[];
  onDelete: () => void;
}
function DeleteRequestsDialog({
  selectedIds,
  onDelete,
}: DeleteRequestsDialogProps) {
  const {close} = useDialogContext();
  const deleteSelectedRequests = useMutation({
    mutationFn: () =>
      apiClient.delete(`backstage-requests/${selectedIds.join(',')}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: appQueries.backstageRequests.invalidateKey,
      });
      toast(message('Requests deleted'));
      onDelete();
      close();
    },
    onError: err => showHttpErrorToast(err),
  });
  return (
    <ConfirmationDialog
      isDanger
      isLoading={deleteSelectedRequests.isPending}
      title={<Trans message="Delete requests" />}
      body={
        <Trans
          message="Are you sure you want to delete selected requests?"
          values={{count: selectedIds.length}}
        />
      }
      confirm={<Trans message="Delete" />}
      onConfirm={() => deleteSelectedRequests.mutate()}
    />
  );
}
