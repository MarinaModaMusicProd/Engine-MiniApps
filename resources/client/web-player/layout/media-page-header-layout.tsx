import clsx from 'clsx';
import {cloneElement, ReactElement, ReactNode} from 'react';

interface MediaPageHeaderLayoutProps {
  className?: string;
  image: ReactElement<{size: string; className?: string}>;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  actionsBar?: ReactNode;
  centerItems?: boolean;
  footer?: ReactNode;
}
export function MediaPageHeaderLayout({
  className,
  image,
  title,
  subtitle,
  description,
  actionsBar,
  footer,
  centerItems = true,
}: MediaPageHeaderLayoutProps) {
  return (
    <div>
      <header
        className={clsx(
          'flex flex-col gap-24 md:flex-row md:gap-34',
          centerItems && 'items-center',
          className,
        )}
      >
        {cloneElement(image, {
          size: image.props.size || 'size-192 md:size-256',
          className: clsx(
            image.props.className,
            'mx-auto flex-shrink-0 dark:shadow-lg',
          ),
        })}
        <div className="min-w-0 flex-auto pb-8">
          <h1 className="mb-10 text-center text-2xl font-semibold md:text-start md:text-4xl">
            {title}
          </h1>
          {subtitle && <div className="mx-auto w-max md:mx-0">{subtitle}</div>}
          {description ? (
            <div className="mx-auto mt-18 w-max text-sm text-muted md:mx-0 md:mt-26">
              {description}
            </div>
          ) : null}

          {footer ? <div className="mt-24">{footer}</div> : null}
        </div>
      </header>
      {actionsBar ? <div className="my-48">{actionsBar}</div> : null}
    </div>
  );
}

interface ActionButtonClassNameProps {
  isFirst?: boolean;
}
export function actionButtonClassName({
  isFirst,
}: ActionButtonClassNameProps = {}) {
  return clsx('min-h-42', isFirst ? 'min-w-128 mr-20' : 'mr-10 min-w-100');
}
