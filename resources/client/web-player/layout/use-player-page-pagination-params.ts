import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {useDeferredValue, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';

export function usePlayerPagePaginationParams(
  defaultSortDescriptor: SortDescriptor,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSetSearchQuery = useDebouncedCallback(setSearchQuery, 300);

  const defferedSearchQuery = useDeferredValue(searchQuery);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
    defaultSortDescriptor,
  );
  const defferedSortDescriptor = useDeferredValue(sortDescriptor);
  const isDefferedLoading =
    searchQuery !== defferedSearchQuery ||
    sortDescriptor !== defferedSortDescriptor;

  const queryParams = {
    query: defferedSearchQuery || '',
    orderBy: defferedSortDescriptor.orderBy,
    orderDir: defferedSortDescriptor.orderDir,
    paginate: 'simple',
  };

  return {
    searchQuery,
    setSearchQuery: debouncedSetSearchQuery,
    sortDescriptor,
    setSortDescriptor,
    isDefferedLoading,
    queryParams,
  };
}
