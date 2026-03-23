import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {Button} from '@ui/buttons/button';
import {Item} from '@ui/forms/listbox/item';
import {Section} from '@ui/forms/listbox/section';
import {message} from '@ui/i18n/message';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {MenuTrigger} from '@ui/menu/menu-trigger';
import {
  ArrowDownWideNarrowIcon,
  ArrowUpWideNarrowIcon,
  CheckIcon,
  Menu,
} from 'lucide-react';

export type DataTableSortOptions = {
  label: MessageDescriptor;
  orderBy: string;
  isDefault?: boolean;
};

const directionOptions = [
  {
    label: message('Ascending'),
    orderDir: 'asc',
  },
  {
    label: message('Descending'),
    orderDir: 'desc',
  },
];

type Props = {
  sortDescriptor: SortDescriptor;
  onSortChange: (sortDescriptor: SortDescriptor) => void;
  className?: string;
  sortOptions: DataTableSortOptions[];
};
export function DataTableSortButton({
  sortDescriptor,
  onSortChange,
  className,
  sortOptions,
}: Props) {
  const defaultSort = sortOptions.find(option => option.isDefault)!;

  sortDescriptor.orderBy = sortDescriptor.orderBy || defaultSort.orderBy;
  sortDescriptor.orderDir = sortDescriptor.orderDir || 'desc';

  const activeSortOption =
    sortOptions.find(option => option.orderBy === sortDescriptor.orderBy) ??
    defaultSort;

  const checkIcon = (
    <LucideIcon className="text-primary" icon={CheckIcon} size="xs" />
  );

  return (
    <MenuTrigger selectionMode="multiple">
      <Button
        variant="outline"
        className={className}
        startIcon={
          sortDescriptor.orderDir === 'asc' ? (
            <LucideIcon icon={ArrowUpWideNarrowIcon} size="xs" />
          ) : (
            <LucideIcon icon={ArrowDownWideNarrowIcon} size="xs" />
          )
        }
      >
        <Trans {...activeSortOption.label} />
      </Button>
      <Menu>
        <Section label={<Trans message="Sort by" />}>
          {sortOptions.map(option => (
            <Item
              key={option.orderBy}
              value={option.orderBy}
              isSelected={sortDescriptor.orderBy === option.orderBy}
              endIcon={
                sortDescriptor.orderBy === option.orderBy ? checkIcon : null
              }
              onSelected={() => {
                onSortChange({
                  orderBy: option.orderBy,
                  orderDir: sortDescriptor.orderDir,
                });
              }}
            >
              <Trans {...option.label} />
            </Item>
          ))}
        </Section>
        <Section label={<Trans message="Direction" />}>
          {directionOptions.map(option => (
            <Item
              key={option.orderDir}
              value={option.orderDir}
              endIcon={
                sortDescriptor.orderDir === option.orderDir ? checkIcon : null
              }
              isSelected={sortDescriptor.orderDir === option.orderDir}
              onSelected={() => {
                onSortChange({
                  orderBy: sortDescriptor.orderBy,
                  orderDir: option.orderDir as 'asc' | 'desc',
                });
              }}
            >
              <Trans {...option.label} />
            </Item>
          ))}
        </Section>
      </Menu>
    </MenuTrigger>
  );
}
