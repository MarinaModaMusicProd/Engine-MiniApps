import {offlinedMediaItems} from '@app/offline/offline-media-items';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {clearPlaybackData} from '@app/offline/playback-data-storage';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {openDialog} from '@ui/overlays/store/dialog-store';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {useCallback, useEffect, useState} from 'react';

type BrowserUsageDetails = {
  caches: number;
  indexeddb: number;
  serviceWorkerRegistrations: number;
};

type UsageDetails = {
  used: number;
  available: number;
  usedPretty: string;
  availablePretty: string;
};

const FIVE_MB = 5_000_000;
const ONE_MB = 1_000_000;

async function getUsage(): Promise<UsageDetails> {
  const estimate = await navigator.storage.estimate();

  let used = estimate.usage ?? 0;
  let available = estimate.quota ?? 0;

  if (used) {
    const usageDetails = (estimate as any)
      .usageDetails as BrowserUsageDetails | null;
    if (usageDetails) {
      used =
        used - (usageDetails.caches + usageDetails.serviceWorkerRegistrations);
    } else {
      // js, shell and other assets cached by service worker takes around this much space
      used = used - FIVE_MB;
    }
  }

  return {
    used,
    available,
    usedPretty: prettyBytes(used),
    availablePretty: prettyBytes(available),
  };
}

export function DownloadsSettingsDialog() {
  const {close} = useDialogContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [usage, setUsage] = useState<UsageDetails | null>(null);
  const anySpaceUsed = usage?.used && usage.used > ONE_MB;

  const refreshUsage = useCallback(
    () => getUsage().then(data => setUsage(data)),
    [],
  );

  useEffect(() => {
    refreshUsage();
  }, []);

  const handleClearAll = async () => {
    setIsDeleting(true);
    await Promise.allSettled([
      offlinedMediaItems.clear(),
      offlinedTracks.clear(),
      clearPlaybackData(),
    ]);
    await refreshUsage();
    setIsDeleting(false);
  };

  return (
    <Dialog size="md">
      <DialogHeader>
        <Trans message="Space usage" />
      </DialogHeader>
      <DialogBody>
        {usage == null ? (
          <div className="flex min-h-40 items-center">
            <ProgressCircle isIndeterminate size="sm" />
          </div>
        ) : (
          <UsageMessage usage={usage} />
        )}
      </DialogBody>
      <DialogFooter>
        {anySpaceUsed && (
          <Button
            variant="outline"
            disabled={isDeleting}
            startIcon={
              isDeleting ? <ProgressCircle isIndeterminate size="xs" /> : null
            }
            onClick={async () => {
              const confirmed = await openDialog(ConfirmDeleteDialog);
              if (confirmed) {
                await handleClearAll();
              }
            }}
          >
            <Trans message="Delete downloaded content" />
          </Button>
        )}
        <Button variant="flat" color="primary" onClick={() => close()}>
          <Trans message="Done" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

type UsageMessageProps = {
  usage: UsageDetails;
};
function UsageMessage({usage}: UsageMessageProps) {
  if (!usage || usage.used < ONE_MB)
    return (
      <Trans message="Music downloaded for offline playback is currently using less then 1mb of space." />
    );
  return (
    <Trans
      message="Music downloaded for offline playback is currently using approximately :used of :available availble space."
      values={{
        used: usage.usedPretty,
        available: usage.availablePretty,
      }}
    />
  );
}

function ConfirmDeleteDialog() {
  return (
    <ConfirmationDialog
      isDanger
      title={<Trans message="Delete downloaded content" />}
      body={
        <Trans message="Are you sure you want to delete all downloaded content?" />
      }
      confirm={<Trans message="Delete" />}
    />
  );
}
