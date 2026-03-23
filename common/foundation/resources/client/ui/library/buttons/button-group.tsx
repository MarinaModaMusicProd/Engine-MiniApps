import clsx from 'clsx';
import React from 'react';
import {ButtonProps} from './button';
import {ButtonSize} from './button-size';
import {ButtonColor, ButtonVariant} from './get-shared-button-style';

export interface ButtonGroupProps {
  children: React.ReactNode[];
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: string;
  className?: string;
  value?: any;
  onChange?: (newValue: any) => void;
  multiple?: boolean;
  disabled?: boolean;
}
export function ButtonGroup(props: ButtonGroupProps) {
  const {
    children,
    color = 'chip',
    variant = 'flat',
    radius = 'rounded-button',
    size,
    className,
    value,
    onChange,
    multiple,
    disabled,
  } = props;

  const isActive = (childValue: any): boolean => {
    // assume that button group is not used as a toggle group, if there is no value given
    if (value === undefined) return false;
    if (multiple) {
      return (value as any[]).includes(childValue);
    }
    return childValue === value;
  };

  const toggleMultipleValue = (childValue: any) => {
    const newValue = [...value];
    const childIndex = value.indexOf(childValue);
    if (childIndex > -1) {
      newValue.splice(childIndex, 1);
    } else {
      newValue.push(childValue);
    }
    return newValue;
  };

  const buttons = React.Children.map(children, (button, i) => {
    if (React.isValidElement(button)) {
      const buttonProps = button.props as ButtonProps;
      const active = isActive(buttonProps.value);
      return React.cloneElement<ButtonProps>(button as any, {
        color: active ? color : undefined,
        variant: active ? (buttonProps.variant ?? variant ?? 'flat') : 'text',
        borderColor: undefined,
        size: 'xs',
        radius: 'rounded-full',
        disabled: buttonProps.disabled || disabled,
        ...buttonProps,
        onClick: e => {
          if (buttonProps.onClick) {
            buttonProps.onClick(e);
          }
          if (!onChange) return;
          if (multiple) {
            onChange?.(toggleMultipleValue(buttonProps.value));
          } else {
            onChange?.(buttonProps.value);
          }
        },
        className: clsx(buttonProps.className),
      });
    }
  });
  return (
    <div className={clsx(radius, 'isolate inline-flex border p-2', className)}>
      {buttons}
    </div>
  );
}
