import {UploadType} from '@app/site-config';
import {ArticleEditorMenubar} from '@common/article-editor/article-editor-menubar';
import {ArticleEditorHeader} from '@common/article-editor/article-editor-sticky-header';
import {articleEditorTipTapExtensions} from '@common/article-editor/article-editor-tiptap-extensions';
import {ArticleEditorTitle} from '@common/article-editor/article-editor-title';
import {DatatablePageHeaderBar} from '@common/datatable/page/datatable-page-with-header-layout';
import {TiptapEditorContent} from '@common/text-editor/tiptap-editor-content';
import {TipTapEditorProvider} from '@common/text-editor/tiptap-editor-provider';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {DashboardSidenav} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {ToggleRightSidebarButton} from '@common/ui/dashboard-layout/toggle-right-sidebar-button';
import {
  FileUploadProvider,
  useFileUploadStore,
} from '@common/uploads/uploader/file-upload-provider';
import FileHandler from '@tiptap/extension-file-handler';
import type {Editor} from '@tiptap/react';
import {Trans} from '@ui/i18n/trans';
import {getImageSize} from '@ui/utils/files/get-image-size';
import {Fragment, ReactNode, useContext, useMemo} from 'react';

interface Props {
  initialContent?: string;
  onChange?: (value: string) => void;
  title?: ReactNode;
  saveButton?: ReactNode;
  imageUploadType: keyof typeof UploadType;
  aside?: ReactNode;
}
export default function ArticleEditorPage(props: Props) {
  return (
    <FileUploadsWrapper>
      <Content {...props} />
    </FileUploadsWrapper>
  );
}

function Content({
  imageUploadType,
  initialContent,
  onChange,
  saveButton,
  title,
  aside,
}: Props) {
  const {rightSidenavStatus} = useContext(DashboardLayoutContext);

  const uploadMultiple = useFileUploadStore(s => s.uploadMultiple);
  const articleExtensions = useMemo(() => {
    const handleImageUpload = (files: File[], editor: Editor, pos?: number) => {
      uploadMultiple(files, {
        uploadType: imageUploadType,
        showToastOnRestrictionFail: true,
        onSuccess: async (entry, file) => {
          const size = await getImageSize(file.native);
          editor
            .chain()
            .insertContentAt(pos ?? editor.state.selection.anchor, {
              type: 'image',
              attrs: {
                src: entry.url,
                width: size.width,
                height: size.height,
              },
            })
            .focus()
            .run();
        },
      });
    };

    return [
      ...articleEditorTipTapExtensions,
      FileHandler.configure({
        onDrop: (editor: Editor, files: File[], pos: number) => {
          handleImageUpload(files, editor, pos);
        },
        onPaste: (editor: Editor, files: File[]) => {
          handleImageUpload(files, editor);
        },
      }),
    ];
  }, [uploadMultiple, imageUploadType]);

  return (
    <TipTapEditorProvider
      extensions={articleExtensions}
      initialContent={initialContent}
      onChange={onChange}
    >
      <section className="dashboard-grid-content dashboard-rounded-panel flex h-full min-h-0 min-w-0 flex-col">
        <ArticleEditorHeader
          saveButton={saveButton}
          rightContent={
            rightSidenavStatus === 'closed' ? (
              <ToggleRightSidebarButton />
            ) : null
          }
        >
          {title}
        </ArticleEditorHeader>
        <ArticleEditorMenubar imageUploadType={imageUploadType} />
        <div className="flex-auto overflow-y-auto">
          <ArticleEditorTitle />
          <TiptapEditorContent className="prose mx-auto flex-auto px-24 dark:prose-invert" />
        </div>
      </section>
      {aside && (
        <DashboardSidenav
          position="right"
          size="w-[350px]"
          className="dashboard-rounded-panel flex-shrink-0 flex-col lg:ml-8"
        >
          <AsideWrapper>{aside}</AsideWrapper>
        </DashboardSidenav>
      )}
    </TipTapEditorProvider>
  );
}

type FileUploadsWrapperProps = {
  children: ReactNode;
};
function FileUploadsWrapper({children}: FileUploadsWrapperProps) {
  return <FileUploadProvider>{children}</FileUploadProvider>;
}

interface InlineAsideProps {
  children: ReactNode;
}
export function AsideWrapper({children}: InlineAsideProps) {
  return (
    <Fragment>
      <DatatablePageHeaderBar rightContent={<ToggleRightSidebarButton />}>
        <Trans message="Details" />
      </DatatablePageHeaderBar>
      <div className="flex-auto overflow-y-auto p-24">{children}</div>
    </Fragment>
  );
}
