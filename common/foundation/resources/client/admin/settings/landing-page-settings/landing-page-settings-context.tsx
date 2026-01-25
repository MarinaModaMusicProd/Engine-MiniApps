import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {ComponentType, createContext} from 'react';

export type CustomSections = Record<
  string,
  {
    label: MessageDescriptor;
    component: ComponentType<{index: number}>;
  }
>;

export type LandingPageSettingsContextValue = {
  customSections?: CustomSections;
  heroSettings?: ComponentType<{formPrefix: string; index: number}>;
};

export const LandingPageSettingsContext =
  createContext<LandingPageSettingsContextValue>(null!);
