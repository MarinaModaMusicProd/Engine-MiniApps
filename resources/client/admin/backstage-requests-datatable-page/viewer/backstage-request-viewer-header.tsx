import {useDeleteBackstageRequest} from '@app/admin/backstage-requests-datatable-page/requests/use-delete-backstage-request';
import {ApproveBackstageRequestDialog} from '@app/admin/backstage-requests-datatable-page/viewer/approve-backstage-request-dialog';
import {DenyBackstageRequestDialog} from '@app/admin/backstage-requests-datatable-page/viewer/deny-backstage-request-dialog';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {DatatablePageHeaderBar} from '@common/datatable/page/datatable-page-with-header-layout';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Fragment} from 'react';

interface Props {
  request: BackstageRequest;
}
export function BackstageRequestViewerHeader({request}: Props) {
  return (
    <DatatablePageHeaderBar
      title={
        <Breadcrumb>
          <BreadcrumbItem to="/admin/backstage-requests">
            <Trans message="Backstage requests" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Trans message="View" />
          </BreadcrumbItem>
        </Breadcrumb>
      }
      rightContent={
        <Fragment>
          {request.status === 'pending' && (
            <Fragment>
              <DialogTrigger type="modal">
                <Button variant="flat" color="primary">
                  <Trans message="Approve" />
                </Button>
                <ApproveBackstageRequestDialog request={request} />
              </DialogTrigger>
              <DialogTrigger type="modal">
                <Button variant="outline">
                  <Trans message="Deny" />
                </Button>
                <DenyBackstageRequestDialog request={request} />
              </DialogTrigger>
            </Fragment>
          )}
          <DeleteButton request={request} />
        </Fragment>
      }
    />
  );
}

function DeleteButton({request}: Props) {
  const deleteRequest = useDeleteBackstageRequest();
  return (
    <DialogTrigger
      type="modal"
      onClose={isConfirmed => {
        if (isConfirmed) {
          deleteRequest.mutate({requestId: request.id});
        }
      }}
    >
      <Button disabled={deleteRequest.isPending} variant="outline">
        <Trans message="Delete" />
      </Button>
      <ConfirmationDialog
        isDanger
        title={<Trans message="Delete request" />}
        body={<Trans message="Are you sure you want to delete this request?" />}
        confirm={<Trans message="Delete" />}
      />
    </DialogTrigger>
  );
}
