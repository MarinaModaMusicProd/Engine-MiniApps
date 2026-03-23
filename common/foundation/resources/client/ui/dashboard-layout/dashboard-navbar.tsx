import {IconButton} from '@ui/buttons/icon-button';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import clsx from 'clsx';
import {PanelLeft} from 'lucide-react';
import {useContext} from 'react';
import {Navbar, NavbarProps} from '../navigation/navbar/navbar';
import {DashboardLayoutContext} from './dashboard-layout-context';

export interface DashboardNavbarProps extends Omit<
  NavbarProps,
  'toggleButton'
> {
  hideToggleButton?: boolean;
}
export function DashboardNavbar({
  children,
  className,
  hideToggleButton,
  ...props
}: DashboardNavbarProps) {
  const {
    isMobileMode,
    leftSidenavCanBeCompact,
    toggleLeftSidenavStatus,
    toggleLeftSidenavCompactMode,
  } = useContext(DashboardLayoutContext);

  const shouldToggleCompactMode = leftSidenavCanBeCompact && !isMobileMode;
  const shouldShowToggle =
    !hideToggleButton && (isMobileMode || leftSidenavCanBeCompact);

  return (
    <Navbar
      className={clsx('dashboard-grid-navbar', className)}
      border="border-b"
      size="sm"
      toggleButton={
        shouldShowToggle ? (
          <IconButton
            size="sm"
            iconSize="xs"
            onClick={() => {
              if (shouldToggleCompactMode) {
                toggleLeftSidenavCompactMode();
              } else {
                toggleLeftSidenavStatus();
              }
            }}
          >
            <LucideIcon icon={PanelLeft} />
          </IconButton>
        ) : undefined
      }
      {...props}
    >
      {children}
    </Navbar>
  );
}
