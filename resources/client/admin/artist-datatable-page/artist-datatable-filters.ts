import {
  ALL_NUMBER_OPERATORS,
  BackendFilter,
  FilterControlType,
  FilterOperator,
} from '@common/datatable/filters/backend-filter';
import {
  createdAtFilter,
  updatedAtFilter,
} from '@common/datatable/filters/timestamp-filters';
import {message} from '@ui/i18n/message';

export const ArtistDatatableFilters: BackendFilter[] = [
  {
    key: 'verified',
    label: message('Status'),
    description: message('Whether artist is verified'),
    defaultOperator: FilterOperator.eq,
    control: {
      type: FilterControlType.Select,
      defaultValue: '01',
      options: [
        {
          key: '01',
          label: message('Verified'),
          value: true,
        },
        {
          key: '02',
          label: message('Not verified'),
          value: false,
        },
      ],
    },
  },
  {
    key: 'disabled',
    label: message('Visibility'),
    description: message('Whether artist is hidden on the site'),
    defaultOperator: FilterOperator.eq,
    control: {
      type: FilterControlType.Select,
      defaultValue: '01',
      options: [
        {
          key: '01',
          label: message('Hidden'),
          value: true,
        },
        {
          key: '02',
          label: message('Visible'),
          value: false,
        },
      ],
    },
  },
  {
    key: 'plays',
    label: message('Plays count'),
    description: message('Number of times artist tracks have been played'),
    defaultOperator: FilterOperator.gte,
    operators: ALL_NUMBER_OPERATORS,
    control: {
      type: FilterControlType.Input,
      inputType: 'number',
      defaultValue: 100,
    },
  },
  {
    key: 'views',
    label: message('Views count'),
    description: message('Number of times artist page have been viewed'),
    defaultOperator: FilterOperator.gte,
    operators: ALL_NUMBER_OPERATORS,
    control: {
      type: FilterControlType.Input,
      inputType: 'number',
      defaultValue: 100,
    },
  },
  createdAtFilter({
    description: message('Date artist was created'),
  }),
  updatedAtFilter({
    description: message('Date artist was last updated'),
  }),
];
