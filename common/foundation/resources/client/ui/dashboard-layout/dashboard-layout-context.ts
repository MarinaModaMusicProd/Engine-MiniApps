import {createContext} from 'react';

export type DashboardSidenavStatus = 'open' | 'closed' | 'compact';

export interface DashboardContextValue {
  name: string;
  isMobileMode: boolean | null;
  leftSidenavStatus: DashboardSidenavStatus;
  setLeftSidenavStatus: (status: DashboardSidenavStatus) => void;
  toggleLeftSidenavStatus: () => void;
  toggleLeftSidenavCompactMode: () => void;
  rightSidenavStatus: DashboardSidenavStatus;
  setRightSidenavStatus: (status: DashboardSidenavStatus) => void;
  toggleRightSidenavStatus: () => void;
  leftSidenavCanBeCompact?: boolean;
}

export const DashboardLayoutContext = createContext<DashboardContextValue>(
  null!,
);
