import {useAuth} from '@common/auth/use-auth';
import {useTrans} from '@ui/i18n/use-trans';
import {useSettings} from '@ui/settings/use-settings';
import clsx from 'clsx';
import {ReactNode} from 'react';
import {Link} from 'react-router';

interface LogoProps {
  color?: 'dark' | 'light';
  className?: string;
  logoType?: 'wide' | 'compact' | 'auto';
  size: string;
  url?: string;
}
export function Logo({
  color = 'light',
  className: propsClassName,
  logoType = 'auto',
  size,
  url,
}: LogoProps) {
  const className = clsx(propsClassName, size);

  if (logoType === 'compact') {
    return <CompactLogo color={color} className={className} url={url} />;
  } else if (logoType === 'wide') {
    return <WideLogo color={color} className={className} url={url} />;
  }

  return <AutoLogo color={color} className={className} url={url} />;
}

interface CompactLogoProps {
  className?: string;
  color: LogoProps['color'];
  url?: string;
}
function CompactLogo({color, className, url}: CompactLogoProps) {
  const {branding} = useSettings();

  // fallback to light logo if dark logo is not available
  const src =
    color === 'dark' && branding.logo_dark_mobile
      ? branding.logo_dark_mobile
      : branding.logo_light_mobile;

  if (!src) return null;

  return (
    <WrapperLink className={className} url={url}>
      <img src={src} className="block w-auto" alt="" />
    </WrapperLink>
  );
}

function AutoLogo({color, className, url}: CompactLogoProps) {
  const {branding} = useSettings();

  let wideLogo: string;
  let compactLogo: string;
  if (color === 'light') {
    wideLogo = branding.logo_light;
    compactLogo = branding.logo_light_mobile;
  } else {
    wideLogo = branding.logo_dark;
    compactLogo = branding.logo_dark_mobile;
  }

  if (!wideLogo && !compactLogo) {
    return null;
  }

  return (
    <WrapperLink className={className} url={url}>
      <picture>
        <source srcSet={compactLogo || wideLogo} media="(max-width: 768px)" />
        <source srcSet={wideLogo} media="(min-width: 768px)" />
        <img className="block h-full w-auto" alt="" />
      </picture>
    </WrapperLink>
  );
}

function WideLogo({color, className, url}: CompactLogoProps) {
  const {branding} = useSettings();

  const src =
    color === 'dark' && branding.logo_dark
      ? branding.logo_dark
      : branding.logo_light;

  if (!src) return null;

  return (
    <WrapperLink className={className} url={url}>
      <img src={src} className="block h-full w-auto" alt="" />
    </WrapperLink>
  );
}

interface WrapperLinkProps {
  className?: string;
  children: ReactNode;
  url?: string;
}
function WrapperLink({className, children, url}: WrapperLinkProps) {
  const {trans} = useTrans();
  const {getRedirectUri} = useAuth();

  return (
    <Link
      to={url || getRedirectUri()}
      className={clsx('block flex-shrink-0', className)}
      aria-label={trans({message: 'Go to homepage'})}
    >
      {children}
    </Link>
  );
}
