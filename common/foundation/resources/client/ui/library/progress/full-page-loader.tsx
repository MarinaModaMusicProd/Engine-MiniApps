import {ProgressCircle} from '@ui/progress/progress-circle';
import clsx from 'clsx';

interface FullPageLoaderProps {
  className?: string;
  screen?: boolean;
}
export function FullPageLoader({className, screen}: FullPageLoaderProps) {
  return (
    <div
      className={clsx(
        'flex flex-auto items-center justify-center',
        screen ? 'h-screen w-screen' : 'h-full w-full',
        className,
      )}
    >
      <ProgressCircle isIndeterminate aria-label="Loading page..." />
    </div>
  );
}
