import React, {ReactNode, useRef} from 'react';
import {IconButton} from '@ui/buttons/icon-button';
import {DragIndicatorIcon} from '@ui/icons/material/DragIndicator';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';
import {MoreVertIcon} from '@ui/icons/material/MoreVert';
import {Trans} from '@ui/i18n/trans';
import {createEventHandler} from '@ui/utils/dom/create-event-handler';
import {useSortable} from '@ui/interactions/dnd/sortable/use-sortable';
import {
  DraggableId,
  DragPreviewRenderer,
} from '@ui/interactions/dnd/use-draggable';
import {DragPreview} from '@ui/interactions/dnd/drag-preview';
import {useIsTouchDevice} from '@ui/utils/hooks/is-touch-device';
import {useReorderCategories} from '@helpdesk/help-center/categories/requests/use-reorder-categories';

interface Props<T extends DraggableId> {
  item: T;
  items: T[];
  onSortEnd: (oldIndex: number, newIndex: number) => void;
  children: ReactNode;
  description?: ReactNode;
  onClick: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
export function HcManagerRow<T extends DraggableId>({
  item,
  items,
  onSortEnd,
  onClick,
  onView,
  onEdit,
  onDelete,
  children,
  description,
}: Props<T>) {
  const domRef = useRef<HTMLTableRowElement>(null);
  const previewRef = useRef<DragPreviewRenderer>(null);
  const isTouchDevice = useIsTouchDevice();
  const reorder = useReorderCategories();

  const {sortableProps, dragHandleRef} = useSortable({
    ref: domRef,
    disabled: isTouchDevice ?? false,
    item,
    items,
    type: 'hcManagerSort',
    preview: previewRef,
    onSortEnd,
  });

  return (
    <div
      className="cursor:pointer mb-12 flex items-center gap-6 rounded-panel border p-12 transition-colors hover:border-primary"
      onClick={createEventHandler(() => onClick())}
      ref={domRef}
      {...sortableProps}
    >
      {!isTouchDevice && (
        <IconButton
          className="text-muted"
          ref={dragHandleRef}
          disabled={reorder.isPending}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DragIndicatorIcon />
        </IconButton>
      )}
      <div>
        <h3 className="text-sm font-semibold">{children}</h3>
        {description && <div className="text-sm text-muted">{description}</div>}
      </div>
      <MenuTrigger>
        <IconButton
          className="ml-auto text-muted"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu>
          <MenuItem value="edit" onSelected={() => onEdit()}>
            <Trans message="Edit" />
          </MenuItem>
          <MenuItem
            value="sendToTop"
            onSelected={() => {
              onSortEnd(items.indexOf(item), 0);
              document.documentElement.scrollTop = 0;
            }}
          >
            <Trans message="Send to top" />
          </MenuItem>
          <MenuItem value="viewInHc" onSelected={() => onView()}>
            <Trans message="View in help center" />
          </MenuItem>
          <MenuItem value="delete" onSelected={() => onDelete()}>
            <Trans message="Delete" />
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <RowDragPreview name={children} ref={previewRef} />
    </div>
  );
}

interface RowDragPreviewProps {
  name: ReactNode;
}
const RowDragPreview = React.forwardRef<
  DragPreviewRenderer,
  RowDragPreviewProps
>(({name}, ref) => {
  return (
    <DragPreview ref={ref}>
      {() => <div className="rounded bg-chip p-6 text-sm shadow">{name}</div>}
    </DragPreview>
  );
});
