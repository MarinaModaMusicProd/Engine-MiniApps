import {BackendFilter} from '@common/datatable/filters/backend-filter';
import {useBackendFilterUrlParams} from '@common/datatable/filters/backend-filter-url-params';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {FilterListSkeleton} from '@common/datatable/filters/filter-list/filter-list-skeleton';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {ButtonSize} from '@ui/buttons/button-size';
import {AnimatePresence, m} from 'framer-motion';

interface Props {
  pinnedFilters?: string[];
  filters: BackendFilter[];
  isLoading?: boolean;
  buttonSize?: ButtonSize;
  margin?: string;
}
export function DatatableFilters({
  pinnedFilters,
  filters,
  isLoading,
  buttonSize,
  margin = 'mb-14',
}: Props) {
  const {encodedFilters, decodedFilters} = useBackendFilterUrlParams(filters);

  if (!isLoading && !pinnedFilters && !decodedFilters.length) {
    return null;
  }

  return (
    <div className={margin}>
      <AnimatePresence initial={false} mode="wait">
        {isLoading && (encodedFilters || pinnedFilters?.length) ? (
          <FilterListSkeleton
            count={decodedFilters.length + (pinnedFilters?.length || 0)}
          />
        ) : (
          <m.div key="filter-list" {...opacityAnimation}>
            <FilterList
              filters={filters}
              pinnedFilters={pinnedFilters}
              buttonSize={buttonSize}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
