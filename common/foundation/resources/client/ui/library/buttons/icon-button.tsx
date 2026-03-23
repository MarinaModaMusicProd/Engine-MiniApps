import {BadgeProps} from '@ui/badge/badge';
import {IconSize, SvgIconProps} from '@ui/icons/svg-icon';
import clsx from 'clsx';
import {cloneElement, forwardRef, ReactElement} from 'react';
import {ButtonBase, ButtonBaseProps} from './button-base';
import {ButtonSize, getButtonSizeStyle} from './button-size';

export interface IconButtonProps extends ButtonBaseProps {
  children: ReactElement;
  padding?: string;
  size?: ButtonSize | null;
  iconSize?: IconSize | null;
  equalWidth?: boolean;
  badge?: ReactElement<BadgeProps>;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      size = 'md',
      // only set icon size based on button size if "ButtonSize" is passed in and not custom className
      iconSize = size && size.length <= 3 ? size : 'md',
      variant = 'text',
      radius = 'rounded-button',
      className,
      padding,
      equalWidth = true,
      badge,
      ...other
    },
    ref,
  ) => {
    const mergedClassName = clsx(
      getButtonSizeStyle(size, {padding, equalWidth, variant}),
      className,
      badge && 'relative',
      other.disabled && other.to && 'pointer-events-none text-disabled',
    );

    const childIcon = children as ReactElement<SvgIconProps>;

    return (
      <ButtonBase
        {...other}
        ref={ref}
        radius={radius}
        variant={variant}
        className={mergedClassName}
      >
        {cloneElement(childIcon, {size: childIcon.props.size || iconSize})}
        {badge}
      </ButtonBase>
    );
  },
);
