import {BackgroundColor} from '@common/text-editor/extensions/background-color';
import {Embed} from '@common/text-editor/extensions/embed';
import {Indent} from '@common/text-editor/extensions/indent';
import {InfoBlock} from '@common/text-editor/extensions/info-block';
import {lowlight} from '@common/text-editor/highlight/lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {TableKit} from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import {Color, TextStyle} from '@tiptap/extension-text-style';
import {Placeholder} from '@tiptap/extensions';
import {AnyExtension} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const articleEditorTipTapExtensions: AnyExtension[] = [
  StarterKit.configure({
    codeBlock: false,
    link: {
      //inclusive: false,
      // only linkify links that start with a protocol
      shouldAutoLink: (value: string) => /^https?:\/\//.test(value),
    },
  }),
  TableKit.configure({
    table: {resizable: true},
  }),
  Placeholder.configure({
    placeholder: 'Write something...',
  }),
  Image,
  Superscript,
  Subscript,
  TextStyle,
  Color,
  BackgroundColor,
  Indent,
  CodeBlockLowlight.configure({
    lowlight,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  InfoBlock,
  Embed,
  // FileHandler.configure({
  //   //allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  //   onDrop: (currentEditor, files, pos) => {
  //     console.log('drop', files, pos);
  //   },
  //   onPaste: (currentEditor, files, htmlContent) => {
  //     console.log('paste', files, htmlContent);
  //     files.forEach(file => {
  //       if (htmlContent) {
  //         // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
  //         // you could extract the pasted file from this url string and upload it to a server for example
  //         console.log(htmlContent); // eslint-disable-line no-console
  //         return false;
  //       }

  //       const fileReader = new FileReader();

  //       fileReader.readAsDataURL(file);
  //       fileReader.onload = () => {
  //         currentEditor
  //           .chain()
  //           .insertContentAt(currentEditor.state.selection.anchor, {
  //             type: 'image',
  //             attrs: {
  //               src: fileReader.result,
  //             },
  //           })
  //           .focus()
  //           .run();
  //       };
  //     });
  //   },
  // }),
];
