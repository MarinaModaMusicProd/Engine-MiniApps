import {MenuConfig, MenuItemConfig} from '@common/menus/menu-config';

export type RecaptchaAction = 'contact' | 'register' | 'link_creation';

export interface BaseBackendSettings {
  version: string;
  branding: {
    logo_light: string;
    logo_dark: string;
    logo_light_mobile: string;
    logo_dark_mobile: string;
    site_name: string;
    site_description: string;
    favicon: string;
  };
  menus: MenuConfig[];
  html_base_uri: string;
  cookie_notice?: {
    enable: boolean;
    position: 'top' | 'bottom';
    button?: MenuItemConfig;
  };
  logging: {
    sentry_public?: string;
  };
  themes?: {
    default_id?: number | string | null;
    user_change: boolean;
  };
  custom_domains?: {
    default_host?: string;
    allow_select?: boolean;
    allow_all_option?: boolean;
  };
  i18n: {
    enable: boolean;
    default_localization: string;
  };
  api?: {
    integrated: boolean;
  };
  billing: {
    integrated: boolean;
    enable: boolean;
    accepted_cards?: string | string[];
    paypal_test_mode: boolean;
    stripe_public_key?: string;
    invoice: {
      address?: string;
      notes?: string;
    };
    paypal: {
      public_key: string;
      enable: boolean;
    };
    stripe: {
      enable: boolean;
    };
  };
  notifications: {
    integrated: boolean;
  };
  notif: {
    subs: {
      integrated: boolean;
    };
  };
  site: {
    hide_docs_button: boolean;
    has_mobile_app: boolean;
    demo: boolean;
  };
  registration?: {
    disable?: boolean;
    policies?: MenuItemConfig[];
  };
  social?: {
    envato?: {
      enable: boolean;
    };
    google?: {
      enable: boolean;
    };
    twitter?: {
      enable: boolean;
    };
    facebook?: {
      enable: boolean;
    };
    compact_buttons: boolean;
    requireAccount?: boolean;
  };
  web3?: {
    ton?: {
      enable: boolean;
    };
    compact_buttons: boolean;
    requireAccount?: boolean;
  };
  auth?: {
    domain_blacklist?: string;
  };
  workspaces: {
    integrated: boolean;
  };
  uploads: {
    chunk_size: number;
    max_size: number;
    available_space: number;
    allowed_extensions?: string[];
    blocked_extensions?: string[];
    public_driver: string;
    uploads_driver: string;
    s3_direct_upload: boolean;
    disable_tus: boolean;
  };
  require_email_confirmation: boolean;
  single_device_login: boolean;
  mail?: {
    contact_page_address?: string;
    handler?: string;
  };
  recaptcha?: {
    enable?: Record<RecaptchaAction, boolean>;
    site_key?: string;
    secret_key?: string;
  };
  broadcasting?: {
    driver?: 'pusher' | 'reverb' | 'ably';
    key?: string;
    cluster?: string;
    host?: string;
    port?: number;
    scheme?: string;
  };
  analytics?: {
    tracking_code?: string;
    gchart_api_key?: string;
  };
}
