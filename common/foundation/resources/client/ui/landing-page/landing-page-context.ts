import {BaseHeroConfig} from '@common/ui/landing-page/hero/base-hero-config';
import {SectionConfig} from '@common/ui/landing-page/landing-page-config';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {Settings} from '@ui/settings/settings';
import {ComponentType, createContext} from 'react';

export type LandingPageContextValue = {
  defaultIcons: Record<string, ComponentType<SvgIconProps>>;
  sections: SectionConfig[];
  sectionRenderers?: Record<
    string,
    ComponentType<{config: any; index: number}>
  >;
  heroSearchBarSlot?: ComponentType<{
    background?: string;
    config: BaseHeroConfig;
  }>;
  adSlotAfterHero?: keyof Omit<NonNullable<Settings['ads']>, 'disable'>;
};

export const LandingPageContext = createContext<LandingPageContextValue>(null!);
