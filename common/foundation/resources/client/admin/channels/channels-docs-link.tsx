import {AdminDocsUrls} from '@app/admin/admin-config';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
import {ButtonSize} from '@ui/buttons/button-size';

interface Props {
  className?: string;
  hash?: string;
  variant?: 'link' | 'button';
  size?: ButtonSize;
}
export function ChannelsDocsLink({
  className,
  hash,
  variant,
  size = '2xs',
}: Props) {
  if (!AdminDocsUrls.pages.channels) return null;
  const link = hash
    ? `${AdminDocsUrls.pages.channels}#${hash}`
    : AdminDocsUrls.pages.channels;
  return (
    <DocsLink link={link} className={className} variant={variant} size={size} />
  );
}
