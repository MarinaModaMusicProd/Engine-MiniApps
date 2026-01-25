import {
  UpdateEvent,
  UpdateStepStatus,
} from '@common/admin/settings/pages/system-settings/update-page/updater-types';
import {Trans} from '@ui/i18n/trans';
import {CheckCircleFilledIcon} from '@ui/icons/check-circle-filled';
import {WarningIcon} from '@ui/icons/material/Warning';
import {ProgressCircle} from '@ui/progress/progress-circle';
import clsx from 'clsx';

type EventMessageProps = {
  event: UpdateEvent;
};
export function UpdateEventMessage({event}: EventMessageProps) {
  return (
    <div
      className={clsx(
        event.status === UpdateStepStatus.Completed && 'opacity-50',
      )}
    >
      <div className="flex items-center gap-8">
        <EventStatusIndicator event={event} />
        <div>{event.message}</div>
      </div>
      {event.context?.error ? (
        <div className="mt-2 break-words text-sm text-danger">
          <Trans message="Update failed:" /> {event.context.error}
        </div>
      ) : null}
    </div>
  );
}

function EventStatusIndicator({event}: EventMessageProps) {
  switch (event.status) {
    case UpdateStepStatus.Active:
      return (
        <ProgressCircle
          isIndeterminate={!event.context?.progressPercentage}
          size="w-24 h-24"
          value={event.context?.progressPercentage}
        />
      );
    case UpdateStepStatus.Completed:
      return <CheckCircleFilledIcon className="text-positive" />;
    case UpdateStepStatus.Failed:
      return <WarningIcon className="text-danger" />;
  }
}
