import clsx from 'clsx';
import {ComponentProps, forwardRef, ReactNode} from 'react';
import {DialogSize} from './dialog';

interface DialogBodyProps extends ComponentProps<'div'> {
  children: ReactNode;
  className?: string;
  padding?: string | null;
  size?: DialogSize;
  scrollClassName?: string;
}
export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  (props, ref) => {
    const {children, className, padding, size, scrollClassName, ...domProps} =
      props;
    return (
      <div
        {...domProps}
        ref={ref}
        className={clsx(
          className,
          scrollClassName ??
            'overflow-y-auto overflow-x-hidden overscroll-contain',
          getPadding(props),
          'flex-auto text-sm',
        )}
      >
        {children}
      </div>
    );
  },
);

function getPadding({size, padding}: DialogBodyProps) {
  if (padding) {
    return padding;
  }
  switch (size) {
    case 'xs':
      return 'p-14';
    case 'sm':
      return 'p-18';
    default:
      return 'p-24';
  }
}
