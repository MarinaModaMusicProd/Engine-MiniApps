import {onlineManager} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

export function useIsOffline() {
  const [isOffline, setIsOffline] = useState(() => !onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe(setIsOffline);
  }, []);

  return isOffline;
}
