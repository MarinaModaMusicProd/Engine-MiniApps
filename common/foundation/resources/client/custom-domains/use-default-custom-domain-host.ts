import {useSettings} from '@ui/settings/use-settings';
import {useMemo} from 'react';

export function useDefaultCustomDomainHost(
  allDomains?: {
    host: string;
  }[],
): string {
  const {custom_domains, base_url} = useSettings();
  return useMemo(() => {
    const selectedHost = custom_domains?.default_host;
    if (selectedHost) {
      const host = allDomains?.find(d => d.host === selectedHost)?.host;
      if (host) return host;
    }
    return base_url.replace(/\/$/, '').replace(/(^\w+:|^)\/\//, '');
  }, [custom_domains, base_url, allDomains]);
}
