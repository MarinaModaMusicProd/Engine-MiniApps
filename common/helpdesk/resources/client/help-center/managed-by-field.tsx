import {Trans} from '@ui/i18n/trans';
import {Item} from '@ui/forms/listbox/item';
import React, {ReactNode} from 'react';
import {RoleSelector} from '@helpdesk/help-center/role-selector';

interface Props {
  className?: string;
  description?: ReactNode;
}
export function ManagedByField({className, description}: Props) {
  return (
    <RoleSelector
      className={className}
      name="managed_by_role"
      label={<Trans message="Managed by" />}
      description={description}
      defaultItem={
        <Item key="admins-default" value={null}>
          <Trans message="Admins" />
        </Item>
      }
    />
  );
}
