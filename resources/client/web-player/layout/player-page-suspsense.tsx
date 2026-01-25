import {PlayerPageErrorMessage} from '@app/web-player/layout/player-page-error-message';
import {onlineManager} from '@tanstack/react-query';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {ReactNode, Suspense} from 'react';
import {useLocation} from 'react-router';

type Props = {
  children: ReactNode;
  offlineFallback?: ReactNode;
  resetSuspenseOnNavigate?: boolean;
};
export function PlayerPageSuspense({
  children,
  offlineFallback,
  resetSuspenseOnNavigate = true,
}: Props) {
  const {pathname} = useLocation();
  // without providing the key, loader will not be shown when navigating to the same page
  return (
    <Suspense
      key={resetSuspenseOnNavigate ? pathname : undefined}
      fallback={<Fallback offlineFallback={offlineFallback} />}
    >
      {children}
    </Suspense>
  );
}

type FallbackProps = {
  offlineFallback?: ReactNode;
};
function Fallback({offlineFallback}: FallbackProps) {
  if (!onlineManager.isOnline()) {
    return offlineFallback || <PlayerPageErrorMessage />;
  }
  return <FullPageLoader className="absolute inset-0 m-auto" />;
}
