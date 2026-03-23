import {useControlledState} from '@react-stately/utils';
import {Underlay} from '@ui/overlays/underlay';
import {
  getFromLocalStorage,
  setInLocalStorage,
} from '@ui/utils/hooks/local-storage';
import {useBlockBodyOverflow} from '@ui/utils/hooks/use-block-body-overflow';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import clsx from 'clsx';
import {AnimatePresence} from 'framer-motion';
import {ComponentPropsWithoutRef, useCallback, useMemo} from 'react';
import {
  DashboardLayoutContext,
  DashboardSidenavStatus,
} from './dashboard-layout-context';

interface DashboardLayoutProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  leftSidenavCanBeCompact?: boolean;
  leftSidenavStatus?: DashboardSidenavStatus;
  onLeftSidenavChange?: (status: DashboardSidenavStatus) => void;
  rightSidenavStatus?: DashboardSidenavStatus;
  compactByDefault?: boolean;
  initialRightSidenavStatus?: DashboardSidenavStatus;
  onRightSidenavChange?: (status: DashboardSidenavStatus) => void;
  height?: string;
  gridClassName?: string;
  blockBodyOverflow?: boolean;
}
export function DashboardLayout(props: DashboardLayoutProps) {
  const {
    children,
    leftSidenavStatus: leftSidenav,
    onLeftSidenavChange,
    rightSidenavStatus: rightSidenav,
    compactByDefault,
    initialRightSidenavStatus,
    onRightSidenavChange,
    name,
    leftSidenavCanBeCompact,
    height = 'h-screen',
    className,
    gridClassName = 'dashboard-grid',
    blockBodyOverflow = true,
    ...domProps
  } = props;

  useBlockBodyOverflow(!blockBodyOverflow);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const [mobileLeftSidenavStatus, setMobileLeftSidenavStatus] =
    useMobileLeftSidenavStatus(props);
  const [desktopLeftSidenavStatus, setDesktopLeftSidenavStatus] =
    useDesktopLeftSidenavStatus(props);

  const [mobileRightSidenavStatus, setMobileRightSidenavStatus] =
    useMobileRightSidenavStatus(props);
  const [desktopRightSidenavStatus, setDesktopRightSidenavStatus] =
    useDesktopRightSidenavStatus(props);

  const leftSidenavStatus = isMobile
    ? mobileLeftSidenavStatus
    : desktopLeftSidenavStatus;
  const setLeftSidenavStatus = isMobile
    ? setMobileLeftSidenavStatus
    : setDesktopLeftSidenavStatus;

  const setRightSidenavStatus = isMobile
    ? setMobileRightSidenavStatus
    : setDesktopRightSidenavStatus;
  const rightSidenavStatus = isMobile
    ? mobileRightSidenavStatus
    : desktopRightSidenavStatus;

  const toggleLeftSidenavStatus = useCallback(() => {
    setLeftSidenavStatus(leftSidenavStatus === 'open' ? 'closed' : 'open');
  }, [leftSidenavStatus, setLeftSidenavStatus]);

  const toggleLeftSidenavCompactMode = useCallback(() => {
    if (isMobile) {
      return toggleLeftSidenavStatus();
    }
    setLeftSidenavStatus(leftSidenavStatus === 'compact' ? 'open' : 'compact');
  }, [
    leftSidenavStatus,
    setLeftSidenavStatus,
    isMobile,
    toggleLeftSidenavStatus,
  ]);

  const toggleRightSidenavStatus = useCallback(() => {
    setRightSidenavStatus(rightSidenavStatus === 'open' ? 'closed' : 'open');
  }, [rightSidenavStatus, setRightSidenavStatus]);

  const shouldShowUnderlay =
    isMobile && (leftSidenavStatus === 'open' || rightSidenavStatus === 'open');

  return (
    <DashboardLayoutContext.Provider
      value={{
        name,
        leftSidenavStatus,
        setLeftSidenavStatus,
        toggleLeftSidenavStatus,
        toggleLeftSidenavCompactMode,
        leftSidenavCanBeCompact,
        rightSidenavStatus,
        setRightSidenavStatus,
        toggleRightSidenavStatus,
        isMobileMode: isMobile,
      }}
    >
      <div
        {...domProps}
        className={clsx(
          'relative isolate',
          isMobile && 'dashboard-mobile-mode',
          gridClassName,
          className,
          height,
        )}
      >
        {children}
        <AnimatePresence>
          {shouldShowUnderlay && (
            <Underlay
              position="fixed"
              key="dashboard-underlay"
              onClick={() => {
                setMobileLeftSidenavStatus('closed');
                setMobileRightSidenavStatus('closed');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayoutContext.Provider>
  );
}

function useMobileLeftSidenavStatus({
  leftSidenavStatus: propsLeftSidenavStatus,
  onLeftSidenavChange,
}: DashboardLayoutProps) {
  return useControlledState(
    propsLeftSidenavStatus,
    'closed',
    onLeftSidenavChange,
  );
}

function useDesktopLeftSidenavStatus({
  name,
  leftSidenavStatus: propsLeftSidenavStatus,
  onLeftSidenavChange,
  compactByDefault,
}: DashboardLayoutProps) {
  const leftSidenavStatusDefault = useMemo(() => {
    const userSelected = getFromLocalStorage<DashboardSidenavStatus>(
      `${name}.sidenav.left.desktop.position`,
    );

    if (userSelected != null) {
      return userSelected;
    }

    return compactByDefault ? 'compact' : 'open';
  }, [name, compactByDefault]);

  const [leftSidenavStatus, _setLeftSidenavStatus] = useControlledState(
    propsLeftSidenavStatus,
    leftSidenavStatusDefault,
    onLeftSidenavChange,
  );

  const setLeftSidenavStatus = useCallback(
    (status: DashboardSidenavStatus) => {
      _setLeftSidenavStatus(status);
      setInLocalStorage(`${name}.sidenav.left.desktop.position`, status);
    },
    [_setLeftSidenavStatus, name],
  );

  return [leftSidenavStatus, setLeftSidenavStatus] as const;
}

function useMobileRightSidenavStatus({
  rightSidenavStatus,
  onRightSidenavChange,
}: DashboardLayoutProps) {
  return useControlledState(rightSidenavStatus, 'closed', onRightSidenavChange);
}

function useDesktopRightSidenavStatus({
  initialRightSidenavStatus,
  name,
  rightSidenavStatus: propsRightSidenavStatus,
  onRightSidenavChange,
}: DashboardLayoutProps) {
  const rightSidenavStatusDefault = useMemo(() => {
    if (initialRightSidenavStatus != null) {
      return initialRightSidenavStatus;
    }

    const userSelected = getFromLocalStorage(
      `${name}.sidenav.right.desktop.position`,
      'open',
    );

    if (userSelected != null) {
      return userSelected;
    }

    return initialRightSidenavStatus || 'open';
  }, [name, initialRightSidenavStatus]);

  const [rightSidenavStatus, _setRightSidenavStatus] = useControlledState(
    propsRightSidenavStatus,
    rightSidenavStatusDefault,
    onRightSidenavChange,
  );

  const setRightSidenavStatus = useCallback(
    (status: DashboardSidenavStatus) => {
      _setRightSidenavStatus(status);
      setInLocalStorage(`${name}.sidenav.right.desktop.position`, status);
    },
    [_setRightSidenavStatus, name],
  );

  return [rightSidenavStatus, setRightSidenavStatus] as const;
}
