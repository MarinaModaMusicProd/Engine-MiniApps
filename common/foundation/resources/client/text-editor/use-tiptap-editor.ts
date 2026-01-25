import {
  Editor,
  EditorEvents,
  Extension,
  Extensions,
  FocusPosition,
  KeyboardShortcutCommand,
} from '@tiptap/core';
import {useEditor} from '@tiptap/react';
import {useCallback, useMemo, useRef} from 'react';

export interface TipTapEditorProps {
  extensions: Extensions;
  autoFocus?: FocusPosition;
  initialContent?: string;
  contentClassName?: string;
  onChange?: (htmlValue: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  changesAsText?: boolean;
  onSubmit?: (data: {editor: Editor}) => void;
  onCreate?: (data: {editor: Editor}) => void;
  submitToClosestForm?: boolean;
  preventNewLine?: boolean;
}
export function useTipTapEditor({
  extensions: initialExtensions,
  autoFocus,
  initialContent,
  contentClassName,
  onChange,
  onBlur,
  onFocus,
  changesAsText,
  onSubmit,
  onCreate,
  submitToClosestForm,
  preventNewLine,
}: TipTapEditorProps) {
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current =
    (onSubmit ?? submitToClosestForm) ? requestFormSubmit : undefined;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const extensions = useMemo(() => {
    const extensions = [...initialExtensions];
    const keybinds: Record<string, KeyboardShortcutCommand> = {};

    if (onSubmitRef.current) {
      keybinds['Cmd-Enter'] = e => {
        onSubmitRef.current?.(e);
        return true;
      };
      keybinds['Ctrl-Enter'] = e => {
        onSubmitRef.current?.(e);
        return true;
      };
    }

    if (preventNewLine) {
      keybinds['Enter'] = e => {
        if (onSubmitRef.current) {
          onSubmitRef.current(e);
        }
        return true;
      };
    }

    if (Object.keys(keybinds).length > 0) {
      const ctrlEnterExtension = Extension.create({
        addKeyboardShortcuts: () => keybinds,
      });
      extensions.push(ctrlEnterExtension);
    }
    return extensions;
  }, [initialExtensions]);

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: contentClassName || '',
      },
    }),
    [contentClassName],
  );

  const onUpdate = useCallback((e: EditorEvents['update']) => {
    let body = changesAsText ? e.editor.getText() : e.editor.getHTML();
    if (body === '<p></p>') {
      body = '';
    }
    onChangeRef.current?.(body);
  }, []);

  return useEditor({
    extensions,
    autofocus: autoFocus,
    content: initialContent,
    shouldRerenderOnTransaction: false,
    editorProps,
    onUpdate,
    onBlur,
    onFocus,
    onCreate,
  });
}

function requestFormSubmit({editor}: {editor: Editor}) {
  const form = editor.$doc.element.closest('form');
  let submitButton = form?.querySelector(
    'button[type="submit"]',
  ) as HTMLButtonElement;

  if (!submitButton && form?.id) {
    submitButton = document.querySelector(
      `button[type="submit"][form="${form.id}"]`,
    ) as HTMLButtonElement;
  }

  if (form && submitButton && !submitButton.disabled) {
    form.requestSubmit(submitButton);
  }
}
