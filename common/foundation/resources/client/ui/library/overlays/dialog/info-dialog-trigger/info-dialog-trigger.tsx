import {IconButton} from '@ui/buttons/icon-button';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {Dialog, DialogSize} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {CircleQuestionMarkIcon} from 'lucide-react';
import {ReactElement, ReactNode} from 'react';

interface Props {
  title?: ReactNode;
  body: ReactNode;
  dialogSize?: DialogSize;
  className?: string;
  icon?: ReactElement<SvgIconProps>;
}
export function InfoDialogTrigger({
  title,
  body,
  dialogSize = 'xs',
  className,
  icon,
}: Props) {
  return (
    <DialogTrigger type="popover">
      <IconButton
        className={clsx('text-muted opacity-70', className)}
        iconSize="xs"
        size="2xs"
      >
        {icon || <LucideIcon icon={CircleQuestionMarkIcon} />}
      </IconButton>
      <Dialog size={dialogSize}>
        {title && (
          <DialogHeader padding="px-18 pt-18" hideDismissButton>
            {title}
          </DialogHeader>
        )}
        <DialogBody className={clsx(!title && 'text-center')}>
          {body}
        </DialogBody>
      </Dialog>
    </DialogTrigger>
  );
}
