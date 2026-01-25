import {TopProgressBar} from '@ui/progress/top-progress-bar';
import {useEffect, useRef, useState} from 'react';

type Props = {
  isLoading: boolean;
  delay?: number;
};
export function useShowGlobalLoadingBar({isLoading, delay = 0}: Props) {
  const [bar] = useState(() => new TopProgressBar());
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        bar.show();
      }, delay);
    } else {
      clearTimeout(timeoutRef.current);
      bar.hide();
    }

    return () => {
      if (!isLoading) {
        clearTimeout(timeoutRef.current);
        bar.hide();
      }
    };
  }, [isLoading, bar, delay]);

  return bar;
}
