import {AdminDocsUrls} from '@app/admin/admin-config';
import {commonAdminQueries} from '@common/admin/common-admin-queries';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
import {GlobalLoadingProgress} from '@common/core/global-loading-progress';
import {DataTableHeader} from '@common/datatable/data-table-header';
import {DataTablePaginationFooter} from '@common/datatable/data-table-pagination-footer';
import {useDatatableSearchParams} from '@common/datatable/filters/utils/use-datatable-search-params';
import {validateDatatableSearch} from '@common/datatable/filters/utils/validate-datatable-search';
import {DatatableFilters} from '@common/datatable/page/datatable-filters';
import {
  DatatablePageHeaderBar,
  DatatablePageScrollContainer,
  DatatablePageWithHeaderBody,
  DatatablePageWithHeaderLayout,
} from '@common/datatable/page/datatable-page-with-header-layout';
import {useDatatableQuery} from '@common/datatable/requests/use-datatable-query';
import {Table} from '@common/ui/tables/table';
import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {DeleteIcon} from '@ui/icons/material/Delete';
import {EditIcon} from '@ui/icons/material/Edit';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Tooltip} from '@ui/tooltip/tooltip';
import {PlusIcon, RefreshCcwIcon} from 'lucide-react';
import {Fragment} from 'react';
import {Link} from 'react-router';
import {FormattedPrice} from '../../billing/formatted-price';
import {Product} from '../../billing/product';
import {ColumnConfig} from '../../datatable/column-config';
import {DataTableEmptyStateMessage} from '../../datatable/page/data-table-emty-state-message';
import {useNavigate} from '../../ui/navigation/use-navigate';
import softwareEngineerSvg from './../tags/software-engineer.svg';
import {PlansIndexPageFilters} from './plans-index-page-filters';
import {useDeleteProduct} from './requests/use-delete-product';
import {useSyncProducts} from './requests/use-sync-products';

const columnConfig: ColumnConfig<Product>[] = [
  {
    key: 'name',
    allowsSorting: true,
    visibleInMode: 'all',
    header: () => <Trans message="Name" />,
    body: product => {
      const price = product.prices[0];

      return (
        <div>
          <div className="mb-2 font-medium">{product.name}</div>
          <div className="text-xs text-muted">
            {product.free ? (
              <Trans message="Free" />
            ) : (
              <FormattedPrice price={price} />
            )}
          </div>
        </div>
      );
    },
  },
  {
    key: 'created_at',
    allowsSorting: true,
    maxWidth: 'max-w-100',
    header: () => <Trans message="Created" />,
    body: product => <FormattedDate date={product.created_at} />,
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    maxWidth: 'max-w-100',
    header: () => <Trans message="Last updated" />,
    body: product => <FormattedDate date={product.updated_at} />,
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    visibleInMode: 'all',
    hideHeader: true,
    align: 'end',
    maxWidth: 'max-w-84',
    body: product => {
      return (
        <Fragment>
          <IconButton
            size="md"
            className="text-muted"
            elementType={Link}
            to={`/admin/plans/${product.id}/edit`}
          >
            <EditIcon />
          </IconButton>
          <DeleteProductButton product={product} />
        </Fragment>
      );
    },
  },
];

export function Component() {
  const navigate = useNavigate();
  const {
    searchParams,
    sortDescriptor,
    mergeIntoSearchParams,
    setSearchQuery,
    isFiltering,
  } = useDatatableSearchParams(validateDatatableSearch);

  const query = useDatatableQuery(
    commonAdminQueries.products.index(searchParams),
  );

  return (
    <DatatablePageWithHeaderLayout>
      <GlobalLoadingProgress query={query} />
      <DatatablePageHeaderBar
        title={<Trans message="Subscription plans" />}
        showSidebarToggleButton
        rightContent={
          <>
            {AdminDocsUrls.pages.subscriptions ? (
              <DocsLink
                variant="button"
                link={AdminDocsUrls.pages.subscriptions}
                size="sm"
              />
            ) : null}
            <Button
              variant="flat"
              color="primary"
              elementType={Link}
              to="/admin/plans/new"
              startIcon={<LucideIcon icon={PlusIcon} />}
            >
              <Trans message="Add new plan" />
            </Button>
          </>
        }
      />
      <DatatablePageWithHeaderBody>
        <DataTableHeader
          searchValue={searchParams.query}
          onSearchChange={setSearchQuery}
          actions={<Actions />}
          filters={PlansIndexPageFilters}
        />
        <DatatableFilters filters={PlansIndexPageFilters} />
        <DatatablePageScrollContainer>
          <Table
            columns={columnConfig}
            data={query.items}
            sortDescriptor={sortDescriptor}
            onSortChange={mergeIntoSearchParams}
            enableSelection={false}
            cellHeight="h-64"
            onAction={item => {
              navigate(`/admin/plans/${item.id}/edit`);
            }}
          />
          {query.isEmpty && (
            <DataTableEmptyStateMessage
              className="mt-50"
              isFiltering={isFiltering}
              image={softwareEngineerSvg}
              title={<Trans message="No plans have been created yet" />}
              filteringTitle={<Trans message="No matching plans" />}
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

interface DeleteProductButtonProps {
  product: Product;
}
function DeleteProductButton({product}: DeleteProductButtonProps) {
  const deleteProduct = useDeleteProduct();
  return (
    <DialogTrigger
      type="modal"
      onClose={confirmed => {
        if (confirmed) {
          deleteProduct.mutate({productId: product.id});
        }
      }}
    >
      <Tooltip label={<Trans message="Delete plan" />}>
        <IconButton
          size="md"
          className="text-muted"
          disabled={deleteProduct.isPending}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <ConfirmationDialog
        title={<Trans message="Delete plan" />}
        body={<Trans message="Are you sure you want to delete this plan?" />}
        confirm={<Trans message="Delete" />}
      />
    </DialogTrigger>
  );
}

function Actions() {
  const syncPlans = useSyncProducts();
  return (
    <Fragment>
      <Button
        variant="outline"
        size="sm"
        disabled={syncPlans.isPending}
        startIcon={<LucideIcon icon={RefreshCcwIcon} size="xs" />}
        onClick={() => {
          syncPlans.mutate();
        }}
      >
        <Trans message="Sync plans" />
      </Button>
    </Fragment>
  );
}
