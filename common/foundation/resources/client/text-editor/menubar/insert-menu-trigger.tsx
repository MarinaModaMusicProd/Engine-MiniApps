import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import {Form} from '@ui/forms/form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {MoreVertIcon} from '@ui/icons/material/MoreVert';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {
  CircleAlertIcon,
  MinusIcon,
  SquarePlayIcon,
  StickyNoteIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {useCurrentTextEditor} from '../tiptap-editor-context';
import {MenubarButtonProps} from './menubar-button-props';

export function InsertMenuTrigger({size}: MenubarButtonProps) {
  const editor = useCurrentTextEditor();
  const [dialog, setDialog] = useState<'embed' | false>(false);
  return (
    <>
      <MenuTrigger
        onItemSelected={key => {
          if (key === 'hr') {
            editor?.commands.focus();
            editor?.commands.setHorizontalRule();
          } else if (key === 'embed') {
            setDialog('embed');
          } else {
            editor?.commands.focus();
            editor?.commands.addInfo({type: key as any});
          }
        }}
      >
        <IconButton
          variant="text"
          size={size}
          className={clsx('flex-shrink-0')}
          disabled={!editor}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu>
          <MenuItem
            value="hr"
            startIcon={<LucideIcon icon={MinusIcon} size="xs" />}
          >
            <Trans message="Horizontal rule" />
          </MenuItem>
          <MenuItem
            value="embed"
            startIcon={<LucideIcon icon={SquarePlayIcon} size="xs" />}
          >
            <Trans message="Embed" />
          </MenuItem>
          <MenuItem
            value="important"
            startIcon={<LucideIcon icon={CircleAlertIcon} size="xs" />}
          >
            <Trans message="Important" />
          </MenuItem>
          <MenuItem
            value="warning"
            startIcon={<LucideIcon icon={TriangleAlertIcon} size="xs" />}
          >
            <Trans message="Warning" />
          </MenuItem>
          <MenuItem
            value="success"
            startIcon={<LucideIcon icon={StickyNoteIcon} size="xs" />}
          >
            <Trans message="Note" />
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <DialogTrigger
        type="modal"
        isOpen={!!dialog}
        onClose={() => {
          setDialog(false);
        }}
      >
        <EmbedDialog />
      </DialogTrigger>
    </>
  );
}

function EmbedDialog() {
  const editor = useCurrentTextEditor();
  const previousSrc = editor?.getAttributes('embed').src;
  const form = useForm<{src: string}>({
    defaultValues: {src: previousSrc},
  });
  const {formId, close} = useDialogContext();
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Insert link" />
      </DialogHeader>
      <DialogBody>
        <Form
          form={form}
          id={formId}
          onSubmit={value => {
            editor?.commands.setEmbed(value);
            close();
          }}
        >
          <FormTextField
            name="src"
            label={<Trans message="Embed URL" />}
            autoFocus
            type="url"
            required
          />
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button onClick={close} variant="text">
          <Trans message="Cancel" />
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={!form.formState.isValid}
          variant="flat"
          color="primary"
        >
          <Trans message="Add" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
