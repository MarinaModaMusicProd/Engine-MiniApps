import {ContextMenuButton} from '@app/web-player/context-dialog/context-dialog-layout';
import {message} from '@ui/i18n/message';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {toast} from '@ui/toast/toast';
import useClipboard from '@ui/utils/hooks/use-clipboard';
import {ReactNode} from 'react';

interface CopyLinkMenuButtonProps {
  link: string;
  children: ReactNode;
}
export function CopyLinkMenuButton({link, children}: CopyLinkMenuButtonProps) {
  const {close: closeMenu} = useDialogContext();
  const [, copyLink] = useClipboard(link);

  return (
    <ContextMenuButton
      enableWhileOffline
      onClick={() => {
        copyLink();
        closeMenu();
        toast(message('Copied link to clipboard'));
      }}
    >
      {children}
    </ContextMenuButton>
  );
}
