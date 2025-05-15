import {ReactNode, Ref} from 'react';
import clsx from 'clsx';

export interface ChartLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
  contentIsFlex?: boolean;
  contentClassName?: string;
  contentRef?: Ref<HTMLDivElement>;
  isLoading?: boolean;
}
export function ChartLayout(props: ChartLayoutProps) {
  const {
    title,
    description,
    children,
    className,
    contentIsFlex = true,
    contentClassName,
    contentRef,
  } = props;

  return (
    <div
      className={clsx(
        'flex h-full flex-auto flex-col rounded-panel border bg p-20 dark:bg-alt',
        className,
      )}
    >
      <div className="flex flex-shrink-0 items-center justify-between pb-10 text-xs">
        <div className="text-sm font-semibold">{title}</div>
        {description && <div className="text-muted">{description}</div>}
      </div>
      <div
        ref={contentRef}
        className={clsx(
          'relative',
          contentIsFlex && 'flex flex-auto items-center justify-center',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
