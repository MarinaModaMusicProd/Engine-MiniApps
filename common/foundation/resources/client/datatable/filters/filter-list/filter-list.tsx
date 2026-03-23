import {ButtonSize} from '@ui/buttons/button-size';
import {IconButton} from '@ui/buttons/icon-button';
import {CloseIcon} from '@ui/icons/material/Close';
import clsx from 'clsx';
import {FilterItemFormValue} from '../add-filter-dialog';
import {BackendFilter} from '../backend-filter';
import {useBackendFilterUrlParams} from '../backend-filter-url-params';
import {FilterListControl} from './filter-list-control';

interface FilterListProps {
  filters: BackendFilter[];
  // these filters will always be shown, even if value is not yet selected for filter
  pinnedFilters?: string[];
  className?: string;
  wrap?: boolean;
  buttonSize?: ButtonSize;
}
export function FilterList({
  filters,
  pinnedFilters,
  className,
  wrap,
  buttonSize = 'xs',
}: FilterListProps) {
  const {decodedFilters, remove, replaceAll} = useBackendFilterUrlParams(
    filters,
    pinnedFilters,
  );

  if (!decodedFilters.length) return null;

  return (
    <div
      className={clsx(
        'flex flex-shrink-0 items-center gap-6',
        className,
        wrap ? 'flex-wrap' : 'overflow-x-auto',
      )}
    >
      {decodedFilters.map((field, index) => {
        const filter = filters.find(f => f.key === field.key);

        if (!filter) return null;

        const handleValueChange = (payload: FilterItemFormValue) => {
          const newFilters = [...decodedFilters];
          newFilters.splice(index, 1, {
            key: filter.key,
            value: payload.value,
            isInactive: false,
            operator: payload.operator || filter.defaultOperator,
          });
          replaceAll(newFilters);
        };

        return (
          <div key={field.key} className="flex items-center">
            {!field.isInactive && (
              <IconButton
                variant="outline"
                size={buttonSize}
                radius="rounded-l-button"
                onClick={() => {
                  remove(field.key);
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
            <FilterListControl
              filter={filter}
              isInactive={field.isInactive}
              value={field.valueKey != null ? field.valueKey : field.value}
              operator={field.operator}
              onValueChange={handleValueChange}
              buttonSize={buttonSize}
            />
          </div>
        );
      })}
    </div>
  );
}
