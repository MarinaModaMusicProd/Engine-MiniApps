import React, {Fragment, StrictMode, useEffect, useRef, useState} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {domAnimation, LazyMotion} from 'framer-motion';
import {queryClient} from '@common/http/query-client';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import {SiteConfig} from '@app/site-config';
import deepMerge from 'deepmerge';
import {BaseSiteConfig} from '@common/core/settings/base-site-config';
import {ThemeProvider} from '@common/core/theme-provider';
import {AppearanceListener} from '@common/admin/appearance/commands/appearance-listener';
import {CookieNotice} from '@common/ui/cookie-notice/cookie-notice';
import {ToastContainer} from '@ui/toast/toast-container';
import {DialogStoreOutlet} from '@ui/overlays/store/dialog-store-outlet';
import type {Router} from '@remix-run/router/dist/router';
import {useSettings} from '@ui/settings/use-settings';
import {useAuth} from '@common/auth/use-auth';
import {verifyEmailRouter} from '@common/auth/ui/email-verification-page/email-verification-page';
import {
  Outlet,
  RouterProvider,
  useNavigation,
  useRouteError,
  useLocation
} from 'react-router-dom';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {TopProgressBar} from '@ui/progress/top-progress-bar';
import {NotFoundPage} from '@common/ui/not-found-page/not-found-page';
import {PageErrorMessage} from '@common/errors/page-error-message';
import {userSuspendedRouter} from '@common/auth/ui/user-suspended-page/user-suspended-page';
import WebApp from '@twa-dev/sdk';
import {TonConnectUIProvider} from "@tonconnect/ui-react";

const mergedConfig = deepMerge(BaseSiteConfig, SiteConfig);

interface Props {
  router: Router;
}

export function CommonProvider({router}: Props) {
  const {base_url} = useSettings();

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LazyMotion features={domAnimation}>
          <SiteConfigContext.Provider value={mergedConfig}>
            <ThemeProvider>
              <TonConnectUIProvider manifestUrl={`${base_url}/tonconnect-manifest.json`}>
                <CommonRouter router={router} />
              </TonConnectUIProvider>
            </ThemeProvider>
          </SiteConfigContext.Provider>
        </LazyMotion>
      </QueryClientProvider>
    </StrictMode>
  );
}

interface CommonRouterProps {
  router: Router;
}
function CommonRouter({router}: CommonRouterProps) {
  const {require_email_confirmation} = useSettings();
  const {user} = useAuth();

  if (user != null && require_email_confirmation && !user.email_verified_at) {
    return (
      <RouterProvider
        router={verifyEmailRouter}
        fallbackElement={<FullPageLoader screen />}
      />
    );
  }

  if (user != null && user.banned_at) {
    return (
      <RouterProvider
        router={userSuspendedRouter}
        fallbackElement={<FullPageLoader screen />}
      />
    );
  }

  return (
    <RouterProvider
      router={router}
      fallbackElement={<FullPageLoader screen />}
    />
  );
}

export function RootRoute() {
  return (
    <Fragment>
      <GlobalTopLoadingBar />
      <Outlet />
      <AppearanceListener />
      <CookieNotice />
      <ToastContainer />
      <DialogStoreOutlet />
    </Fragment>
  );
}

export function RootErrorElement() {
  const error = useRouteError();
  if ((error as any)?.status === 404) {
    return <NotFoundPage />;
  }
  return <PageErrorMessage />;
}

export function GlobalTopLoadingBar() {
  const [bar] = useState(() => new TopProgressBar());
  const {state} = useNavigation();
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!window && !WebApp?.initData) return;
    WebApp.ready();
    WebApp.expand();
    WebApp.BackButton.onClick(() => {
      history.back();
    });

    if (window.location.pathname === '/') {
      WebApp.BackButton.hide();
    } else {
      WebApp.BackButton.show();
    }
  });

  useEffect(() => {
    // react router will always set loading to true when "lazy" is set on route, even if that router is already loaded, this will result in loading bar showing for a few milliseconds
    if (state === 'loading') {
      timeoutRef.current = setTimeout(() => {
        bar.show();
      }, 50);
    } else {
      clearTimeout(timeoutRef.current);
      bar.hide();
    }

    return () => {
      if (state !== 'loading') {
        clearTimeout(timeoutRef.current);
        bar.hide();
      }
    };
  }, [state, bar]);

  return null;
}
