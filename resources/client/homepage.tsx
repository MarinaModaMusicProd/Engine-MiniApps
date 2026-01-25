import {Component as LandingPage} from '@app/landing-page/landing-page';
import {WebPlayerLayout} from '@app/web-player/layout/web-player-layout';
import {useSettingsPreviewMode} from '@common/admin/settings/preview/use-settings-preview-mode';
import {AuthRoute} from '@common/auth/guards/auth-route';
import {useAuth} from '@common/auth/use-auth';
import {useSettings} from '@ui/settings/use-settings';
import {useMatches} from 'react-router';

export function Component() {
  const {isInsideSettingsPreview, settingsEditorParams} =
    useSettingsPreviewMode();
  const {homepage} = useSettings();
  const {user} = useAuth();
  const matches = useMatches();
  const type = homepage?.type ?? '';

  if (
    isInsideSettingsPreview &&
    settingsEditorParams.forceHomepage === 'landing'
  ) {
    return <LandingPage />;
  }

  // if user is logged in or homepage is a channel, fallthrough to web player routing
  if (
    type.startsWith('channel') ||
    (type.startsWith('landing') && user) ||
    (type.startsWith('login') && user) ||
    matches.at(-1)?.id !== 'webPlayerIndex'
  ) {
    return (
      <AuthRoute requireLogin={false} permission="music.view">
        <WebPlayerLayout />
      </AuthRoute>
    );
  }

  return <LandingPage />;
}
