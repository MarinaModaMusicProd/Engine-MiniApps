import {Outlet} from 'react-router';
import {AdminSidebar} from './admin-sidebar';
import {DashboardLayout} from '@common/ui/dashboard-layout/dashboard-layout';
import {DashboardContent} from '@common/ui/dashboard-layout/dashboard-content';
import {DashboardSidenav} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {DashboardNavbar} from '@common/ui/dashboard-layout/dashboard-navbar';
import {
  AdminSetupAlert,
  useAdminSetupAlerts,
} from '@common/admin/use-admin-setup-alerts';
import {SectionHelper} from '@common/ui/other/section-helper';
import {ErrorIcon} from '@ui/icons/material/Error';
import {
  setInLocalStorage,
  useLocalStorage,
} from '@ui/utils/hooks/local-storage';
import clsx from 'clsx';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {DashboardLeftSidebarVariant} from '@common/ui/dashboard-layout/dashboard-left-sidebar';

export function AdminLayout() {
  const isMobile = useIsMobileMediaQuery();
  const variant: DashboardLeftSidebarVariant = isMobile
    ? 'withNavbar'
    : 'withoutNavbar';
  return (
    <DashboardLayout name="admin" leftSidenavCanBeCompact className="bg-alt">
      {variant === 'withNavbar' && (
        <DashboardNavbar size="sm" menuPosition="admin-navbar" />
      )}
      <DashboardSidenav position="left" size="sm">
        <AdminSidebar variant="withoutNavbar" />
      </DashboardSidenav>
      <DashboardContent>
        <div
          className={clsx(
            variant === 'withoutNavbar'
              ? 'relative bg ring-divider dark:bg-alt md:mt-6 md:rounded-tl-md md:shadow-sm md:ring md:ring-1'
              : 'border-l bg dark:bg-alt',
          )}
        >
          <SetupAlertsList />
          <Outlet />
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}

function SetupAlertsList() {
  const {data} = useAdminSetupAlerts();
  const [dismissValue] = useLocalStorage<{
    timestamp: number;
  } | null>('admin-setup-alert-dismissed', null);

  // show alert if 1 day passed since last dismiss
  const shouldShowAlert =
    !dismissValue || Date.now() - dismissValue.timestamp > 86400000;

  if (!data?.alerts.length || !shouldShowAlert) {
    return null;
  }

  return (
    <div className="fixed left-24 right-24 top-24 z-10 mx-auto w-max max-w-[calc(100%-48px)] overflow-hidden rounded-panel bg shadow-md">
      <SetupAlert alert={data.alerts[0]} />
    </div>
  );
}

interface SetupAlertProps {
  alert: AdminSetupAlert;
}
function SetupAlert({alert}: SetupAlertProps) {
  const description = (
    <div dangerouslySetInnerHTML={{__html: alert.description}}></div>
  );
  return (
    <SectionHelper
      leadingIcon={<ErrorIcon size="xs" className="text-danger" />}
      onClose={() => {
        setInLocalStorage('admin-setup-alert-dismissed', {
          timestamp: Date.now(),
        });
      }}
      key={alert.title}
      title={alert.title}
      description={description}
      color="neutral"
    />
  );
}
