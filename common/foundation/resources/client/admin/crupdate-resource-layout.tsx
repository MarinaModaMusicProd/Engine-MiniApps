import {DatatablePageHeaderBar} from '@common/datatable/page/datatable-page-with-header-layout';
import {Button, ButtonProps} from '@ui/buttons/button';
import {Form} from '@ui/forms/form';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';
import {AnimatePresence, m} from 'framer-motion';
import {cloneElement, Fragment, ReactElement, ReactNode} from 'react';
import {
  FieldValues,
  SubmitHandler,
  useFormContext,
  UseFormReturn,
} from 'react-hook-form';

interface Props<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  form: UseFormReturn<T>;
  title: ReactElement;
  tabs?: ReactNode;
  isLoading: boolean;
  children: ReactNode;
  actions?: ReactNode;
  disableSaveWhenNotDirty?: boolean;
  wrapInContainer?: boolean;
  submitButtonText?: ReactNode;
  className?: string;
  containerClassName?: string;
  navbar?: ReactNode;
}
export function CrupdateResourceLayout<T extends FieldValues>({
  onSubmit,
  form,
  title,
  tabs,
  children,
  actions,
  isLoading = false,
  disableSaveWhenNotDirty = false,
  wrapInContainer = true,
  submitButtonText,
  className,
  containerClassName,
  navbar,
}: Props<T>) {
  const isDirty = !disableSaveWhenNotDirty
    ? true
    : Object.keys(form.formState.dirtyFields).length;

  const saveButton = (
    <Button
      variant="flat"
      color="primary"
      type="submit"
      disabled={isLoading || !isDirty}
    >
      {submitButtonText ?? <Trans message="Save" />}
    </Button>
  );

  return (
    <Form
      onSubmit={onSubmit}
      onBeforeSubmit={() => form.clearErrors()}
      form={form}
      className={clsx('flex h-full flex-col', className)}
    >
      {navbar}
      <CrupdateResourceHeader
        endActions={
          <Fragment>
            {actions}
            {saveButton}
          </Fragment>
        }
        border={tabs ? 'border-none' : undefined}
      >
        {title}
      </CrupdateResourceHeader>
      {tabs && <div className="flex-shrink-0">{tabs}</div>}
      <div className="overflow-y-auto">
        <div
          className={clsx(
            wrapInContainer ? 'container mx-auto px-24 py-56' : undefined,
            containerClassName,
          )}
        >
          {children}
        </div>
      </div>
    </Form>
  );
}

interface CrupdateResourceHeaderProps {
  children: ReactElement;
  endActions?: ReactNode;
  border?: string;
}
export function CrupdateResourceHeader({
  children,
  endActions,
  border,
}: CrupdateResourceHeaderProps) {
  return (
    <DatatablePageHeaderBar
      showSidebarToggleButton
      title={children}
      rightContent={endActions}
      border={border}
    />
  );
}

interface CrupdateResourceSectionProps {
  label: ReactElement;
  labelMargin?: string;
  children: ReactNode;
  margin?: string;
}

export function CrupdateResourceSection({
  label,
  children,
  margin = 'mb-48',
  labelMargin = 'mb-16',
}: CrupdateResourceSectionProps) {
  return (
    <section className={clsx(margin)}>
      <div className={clsx(labelMargin, 'text-lg font-semibold')}>{label}</div>
      {children}
    </section>
  );
}

interface DirtyFormSaveDrawerProps {
  saveButton?: ReactElement<ButtonProps>;
  isLoading?: boolean;
}
export function DirtyFormSaveDrawer({
  saveButton,
  isLoading,
}: DirtyFormSaveDrawerProps) {
  const {formState, reset} = useFormContext();
  const isDirty =
    formState.isDirty && Object.keys(formState.dirtyFields).length > 0;
  return (
    <AnimatePresence>
      {isDirty && (
        <m.div
          key="dirty-panel"
          initial={{y: 100, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: 100, opacity: 0}}
          transition={{duration: 0.2}}
          className="fixed bottom-28 left-0 right-0 z-20"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-16 rounded-panel border border-divider-lighter bg px-16 py-12 shadow-lg">
            <div className="mr-auto text-sm font-semibold text-muted">
              <Trans message="Unsaved changes" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
              }}
            >
              <Trans message="Discard" />
            </Button>
            {saveButton ? (
              cloneElement<ButtonProps>(saveButton, {size: 'xs'})
            ) : (
              <Button
                variant="flat"
                color="primary"
                type="submit"
                size="sm"
                disabled={isLoading}
              >
                <Trans message="Save changes" />
              </Button>
            )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
