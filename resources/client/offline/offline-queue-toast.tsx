import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {offlineQueue} from '@app/offline/offline-queue';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {CloseIcon} from '@ui/icons/material/Close';
import {ProgressBar} from '@ui/progress/progress-bar';
import {useEffect, useState} from 'react';

export function OfflineQueueToast() {
  const offlineQueueSize = useOfflineEntitiesStore(s => s.offlineQueue.size);
  const [downloadProgressTotal, setDownloadProgressTotal] = useState(() =>
    downloadProgressToTotal(offlineQueue.getDownloadProgress()),
  );

  useEffect(() => {
    let prevProgress = 0;
    return offlineQueue.listen('onActiveDownloadsChanged', progress => {
      const newProgress = downloadProgressToTotal(progress);
      if (newProgress !== prevProgress) {
        setDownloadProgressTotal(newProgress);
      }
      prevProgress = newProgress;
    });
  }, []);

  return (
    <div className="fixed left-12 right-12 top-12 z-toast mx-auto flex min-w-320 max-w-max items-center gap-10 overflow-hidden rounded-lg border bg p-12 shadow">
      <div className="mr-auto text-sm text-main">
        <div className="mb-2">
          <Trans
            message="Downloading :count tracks..."
            values={{count: offlineQueueSize}}
          />
        </div>
        <div className="text-xs text-muted">
          <Trans message="Keep window open to continue" />
        </div>
      </div>
      <IconButton
        size="sm"
        onClick={() => {
          offlinedEntitiesStore().setOfflineToastVisible(false);
        }}
      >
        <CloseIcon />
      </IconButton>
      <ProgressBar
        size="xs"
        value={downloadProgressTotal}
        isIndeterminate={
          downloadProgressTotal === 100 || downloadProgressTotal === 0
        }
        className="absolute bottom-0 left-0 right-0"
        trackHeight="h-2"
      />
    </div>
  );
}

function downloadProgressToTotal(progress: Map<number, number>): number {
  const array = Array.from(progress.values()).map(d => d);
  if (array.length === 0) {
    return 0;
  }
  return Math.trunc(
    array.reduce((acc, value) => acc + value, 0) / array.length,
  );
}
