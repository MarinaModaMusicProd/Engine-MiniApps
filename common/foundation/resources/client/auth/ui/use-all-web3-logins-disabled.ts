import {useSettings} from '@ui/settings/use-settings';

export function useAllWeb3LoginsDisabled(): boolean {
  const {web3} = useSettings();
  return (
    !web3?.ton?.enable
  );
}
