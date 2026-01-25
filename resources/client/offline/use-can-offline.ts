import {useAuth} from '@common/auth/use-auth';
import {useSettings} from '@ui/settings/use-settings';

export function useCanOffline(): boolean {
  const {player} = useSettings();
  const {hasPermission} = useAuth();
  return !!(player?.enable_offlining && hasPermission('music.offline'));
}
