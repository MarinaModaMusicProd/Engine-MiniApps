import {BackgroundSelectorConfig} from '@common/background-selector/background-selector-config';
import {MenuItemConfig} from '@common/menus/menu-config';

export interface WidgetConfig {
  hide?: boolean;
  greeting?: string;
  greetingAnonymous?: string;
  introduction?: string;
  logo?: string;
  showAvatars?: boolean;
  background?: BackgroundSelectorConfig;
  fadeBg?: boolean;
  homeNewChatTitle?: string;
  homeNewChatSubtitle?: string;
  homeLinks?: MenuItemConfig[];
  showHcCard?: boolean;
  hideHomeArticles?: boolean;
  hideNavigation?: boolean;
  defaultScreen?: string;
  screens?: string[];
  launcherIcon?: string;
  defaultMessage?: string;
  inputPlaceholder?: string;
  agentsAwayMessage?: string;
  inQueueMessage?: string;
  position?: 'left' | 'right';
  spacing?: {side: string; bottom: string};
  inheritThemes?: boolean;
  defaultTheme?: 'light' | 'dark' | 'system';
  forms?: {
    preChat?: {
      disabled?: boolean;
      elements: WidgetFormElementConfig[];
    };
    postChat?: {
      disabled?: boolean;
      elements: WidgetFormElementConfig[];
    };
  };
}

export interface WidgetFormInformationConfig {
  id: string;
  name: 'information';
  message: string;
}

interface WidgetFormTextFieldConfig {
  id: string;
  name: 'name' | 'email' | 'input';
  label: string;
  required?: boolean;
}

interface WidgetFormChoiceListConfig {
  id: string;
  name: 'radio' | 'checkboxes' | 'dropdown' | 'group';
  label: string;
  options: {label: string; id: string; value?: string | number}[];
  required?: boolean;
}

export type WidgetFormElementConfig =
  | WidgetFormInformationConfig
  | WidgetFormTextFieldConfig
  | WidgetFormChoiceListConfig;
