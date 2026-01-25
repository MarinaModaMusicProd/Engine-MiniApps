import {Trans} from '@ui/i18n/trans';
import {cloneElement, ReactElement} from 'react';

interface Props {
  image: ReactElement<{size: string; className: string}>;
  name: ReactElement;
  description?: ReactElement;
}
export function BackstageInsightsTitle({image, name, description}: Props) {
  return (
    <div className="flex items-center gap-10">
      {cloneElement(image, {
        size: image.props.size ?? 'w-24 h-24',
        className: 'rounded',
      })}
      <div>
        <h1 className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base">
          “{name}“ <Trans message="insights" />
        </h1>
        {description && <div className="text-sm text-muted">{description}</div>}
      </div>
    </div>
  );
}
