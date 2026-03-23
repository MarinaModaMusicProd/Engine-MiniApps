import {SvgIcon, SvgIconProps} from '@ui/icons/svg-icon';
import {LucideProps} from 'lucide-react';
import {forwardRef, ForwardRefExoticComponent, RefAttributes} from 'react';

// wrapper for lucide icon svg inner contents (<path>, <rect>, <circle>, etc.)
export const LucideIconWrapper = forwardRef<SVGSVGElement, SvgIconProps>(
  ({children, size = 'md', strokeWidth = 2, ...props}, ref) => {
    return (
      <SvgIcon
        fill="fill-none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        size={size}
        {...props}
        ref={ref}
      >
        {children}
      </SvgIcon>
    );
  },
);

// wrapper for full lucide svg react component
type Props = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
  size?: SvgIconProps['size'];
  strokeWidth?: number;
  className?: string;
};
export const LucideIcon = function ({
  icon,
  size = 'md',
  strokeWidth = 2,
  className,
}: Props) {
  const Icon = icon;
  return (
    <Icon
      size={iconSizeToPx(size)}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

function iconSizeToPx(size: SvgIconProps['size']) {
  switch (size) {
    case '2xs':
      return 12;
    case 'xs':
      return 16;
    case 'sm':
      return 20;
    case 'lg':
      return 35;
    case 'xl':
      return 43;
  }
  return 24;
}
