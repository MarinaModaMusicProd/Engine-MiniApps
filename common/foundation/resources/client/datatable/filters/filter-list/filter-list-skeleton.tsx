import {opacityAnimation} from '@ui/animation/opacity-animation';
import {ButtonSize} from '@ui/buttons/button-size';
import {Skeleton} from '@ui/skeleton/skeleton';
import clsx from 'clsx';
import {m} from 'framer-motion';

const widths = ['w-90', 'w-76', 'w-128'];

interface Props {
  count?: number;
  buttonSize?: ButtonSize;
}
export function FilterListSkeleton({count, buttonSize}: Props) {
  return (
    <m.div
      className={clsx(
        'flex items-center gap-6',
        buttonSizeToHeight(buttonSize),
      )}
      key="filter-list-skeleton"
      {...opacityAnimation}
    >
      {Array.from({length: count || 3}).map((_, index) => (
        <Skeleton
          key={index}
          variant="rect"
          size={`h-full ${widths[index % widths.length]}`}
          radius="rounded-md"
        />
      ))}
    </m.div>
  );
}

function buttonSizeToHeight(buttonSize: ButtonSize = 'xs'): string {
  switch (buttonSize) {
    case 'xs':
      return 'h-30';
    case 'sm':
      return 'h-36';
    case 'md':
      return 'h-42';
    case 'lg':
      return 'h-50';
  }
  return 'h-30';
}
