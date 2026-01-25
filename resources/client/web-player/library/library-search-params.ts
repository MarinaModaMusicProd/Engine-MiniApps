import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';

export type LibrarySearchParams = {
  query?: string;
  orderBy?: string;
  orderDir?: string;
  with?: string;
};

export const defaultLibrarySortDescriptor = {
  orderBy: 'likes.created_at',
  orderDir: 'desc',
} satisfies SortDescriptor;
