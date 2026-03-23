export const ignoredSentryErrors = [
  'Failed to fetch dynamically imported module',
  "Failed to execute 'removeChild' on 'Node'",
  "Failed to execute 'insertBefore' on 'Node'",
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Importing a module script failed.',
  'chrome-extension://',
  'AbortError: Share canceled',
  'Could not cue media',

  // axios
  'Request failed with status code',
  'Network Error',
  new RegExp('^CancelledError'),
  new RegExp('^timeout exceeded'),
  new RegExp('^Request aborted'),
  'AxiosError',
];
