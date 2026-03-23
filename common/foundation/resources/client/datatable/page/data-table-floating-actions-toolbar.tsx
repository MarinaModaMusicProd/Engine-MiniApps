import {IconButton} from '@ui/buttons/icon-button';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {Tooltip} from '@ui/tooltip/tooltip';
import {m} from 'framer-motion';
import {CheckCheckIcon, XIcon} from 'lucide-react';
import {ReactNode} from 'react';

type Props = {
  selectedItems: (number | string)[];
  children: ReactNode;
  onClear: () => void;
  onSelectAll?: () => void;
};
export function DataTableFloatingActionsToolbar({
  selectedItems,
  children,
  onClear,
  onSelectAll,
}: Props) {
  return (
    <m.div
      initial={{opacity: 0, y: 100}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 100}}
      transition={{duration: 0.1}}
      className="fixed bottom-24 left-0 right-0 z-10 mx-auto flex w-max min-w-440 max-w-[calc(100vw-32px)] items-center rounded-panel border bg p-12 text-sm shadow-lg"
    >
      <IconButton onClick={() => onClear()} size="xs" className="mr-6">
        <LucideIcon icon={XIcon} />
      </IconButton>
      <div className="mr-auto pr-12 font-medium">
        <Trans
          message="[one 1 item|other :count items] selected"
          values={{count: selectedItems.length}}
        />
      </div>

      <div className="flex items-center gap-8">
        {onSelectAll ? (
          <Tooltip label={<Trans message="Select all" />}>
            <IconButton
              onClick={() => onSelectAll()}
              size="xs"
              variant="outline"
            >
              <LucideIcon icon={CheckCheckIcon} />
            </IconButton>
          </Tooltip>
        ) : null}
        {children}
      </div>
    </m.div>
  );
}
