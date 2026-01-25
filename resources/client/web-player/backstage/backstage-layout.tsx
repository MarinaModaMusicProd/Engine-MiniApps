import {Footer} from '@common/ui/footer/footer';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {ComponentPropsWithoutRef, ReactNode} from 'react';
import darkBgImage from './images/dark-bg.svg';
import lightBgImage from './images/light-bg.svg';

interface Props extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}
export function BackstageLayout({children, ...domProps}: Props) {
  const isDarkMode = useIsDarkMode();
  return (
    <div className="flex h-screen flex-col" {...domProps}>
      <Navbar className="flex-shrink-0" color="bg" darkModeColor="bg" />
      <div
        className="relative flex-auto overflow-y-auto bg-cover"
        style={{
          backgroundImage: `url(${isDarkMode ? darkBgImage : lightBgImage})`,
        }}
      >
        <div className="container mx-auto flex min-h-full flex-col p-14 md:p-24">
          <div className="flex-auto">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
