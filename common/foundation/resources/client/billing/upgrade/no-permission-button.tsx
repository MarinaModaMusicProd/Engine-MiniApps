import {FeatureLockedDialog} from '@common/billing/upgrade/feature-locked-dialog';
import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useSettings} from '@ui/settings/use-settings';
import {Tooltip} from '@ui/tooltip/tooltip';
import clsx from 'clsx';
import {CrownIcon, LockKeyholeIcon} from 'lucide-react';
import {ReactNode} from 'react';

interface UpgradeButtonProps {
  message?: ReactNode;
  className?: string;
  iconButton?: boolean;
}
export function NoPermissionButton({
  message,
  className,
  iconButton,
}: UpgradeButtonProps) {
  const {billing} = useSettings();

  if (!billing?.enable) {
    return <GenericButton className={className} />;
  }

  return (
    <DialogTrigger type="popover" triggerOnHover>
      {iconButton ? (
        <IconButton className={className} color="primary" size="sm">
          <LucideIcon icon={CrownIcon} />
        </IconButton>
      ) : (
        <button
          className={clsx(
            className,
            'flex max-w-fit items-center gap-6 whitespace-nowrap rounded-button border border-divider-lighter bg-chip px-8 py-1 text-xs font-medium transition-colors hover:bg-chip/90',
          )}
        >
          <LucideIcon icon={CrownIcon} size="2xs" />
          <Trans message="Upgrade" />
        </button>
      )}
      <FeatureLockedDialog message={message} />
    </DialogTrigger>
  );
}

interface GenericButtonProps {
  className?: string;
}
function GenericButton({className}: GenericButtonProps) {
  return (
    <Tooltip
      label={
        <Trans message="You don't have permissions to access this feature." />
      }
    >
      <LucideIcon
        icon={LockKeyholeIcon}
        size="xs"
        className={clsx('text-muted', className)}
      />
    </Tooltip>
  );
}
