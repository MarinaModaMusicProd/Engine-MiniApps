import {Button} from '@ui/buttons/button';
import {ButtonSize} from '@ui/buttons/button-size';
import {Trans} from '@ui/i18n/trans';
import {KeyboardArrowDownIcon} from '@ui/icons/material/KeyboardArrowDown';
import clsx from 'clsx';
import {ComponentPropsWithRef, forwardRef, ReactNode} from 'react';
import {BackendFilter, FilterControlType} from '../backend-filter';

interface TriggerButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'color'
> {
  isInactive?: boolean;
  filter: BackendFilter;
  children?: ReactNode;
  buttonSize?: ButtonSize;
}
export const FilterListTriggerButton = forwardRef<
  HTMLButtonElement,
  TriggerButtonProps
>((props, ref) => {
  // pass through all props from menu trigger and dialog trigger to button
  const {isInactive, filter, buttonSize, ...domProps} = props;

  if (isInactive) {
    return (
      <InactiveFilterButton
        filter={filter}
        buttonSize={buttonSize}
        {...domProps}
        ref={ref}
      />
    );
  }

  return (
    <ActiveFilterButton
      filter={filter}
      buttonSize={buttonSize}
      {...domProps}
      ref={ref}
    />
  );
});

interface InactiveFilterButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'color'
> {
  filter: BackendFilter;
  buttonSize?: ButtonSize;
}
export const InactiveFilterButton = forwardRef<
  HTMLButtonElement,
  InactiveFilterButtonProps
>(({filter, buttonSize, ...domProps}, ref) => {
  return (
    <Button
      variant="outline"
      size={buttonSize}
      radius="rounded-md"
      border="border"
      ref={ref}
      endIcon={<KeyboardArrowDownIcon />}
      {...domProps}
    >
      <Trans {...filter.label} />
    </Button>
  );
});

export const ActiveFilterButton = forwardRef<
  HTMLButtonElement,
  InactiveFilterButtonProps
>(({filter, children, buttonSize, ...domProps}, ref) => {
  const isBoolean = filter.control.type === FilterControlType.BooleanToggle;
  return (
    <Button
      variant="outline"
      size={buttonSize}
      radius="rounded-r-button"
      border="border-y border-r"
      endIcon={!isBoolean && <KeyboardArrowDownIcon />}
      ref={ref}
      {...domProps}
    >
      <span className={clsx(!isBoolean && 'mr-8 border-r pr-8')}>
        <Trans {...filter.label} />
      </span>
      {children}
    </Button>
  );
});
