import {appRouter} from '@app/app-router';
import {ALBUM_MODEL} from '@app/web-player/albums/album';
import {GetAlbumResponse} from '@app/web-player/albums/requests/get-album-response';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {GetPlaylistResponse} from '@app/web-player/playlists/requests/get-playlist-response';
import {SearchResponse} from '@app/web-player/search/search-response';
import {GetTrackResponse} from '@app/web-player/tracks/requests/get-track-response';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {FullUserProfile, UserArtist} from '@app/web-player/users/user-profile';
import {BaseBackendUser} from '@common/auth/base-backend-user';
import {Product} from '@common/billing/product';
import {Channel} from '@common/channels/channel';
import {BaseBackendBootstrapData} from '@common/core/base-backend-bootstrap-data';
import {CommonProvider} from '@common/core/common-provider';
import {BaseBackendSettings} from '@common/core/settings/base-backend-settings';
import {FetchCustomPageResponse} from '@common/custom-page/use-custom-page';
import {ignoredSentryErrors} from '@common/errors/ignored-sentry-errors';
import {SectionConfig} from '@common/ui/landing-page/landing-page-config';
import * as Sentry from '@sentry/react';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {rootEl} from '@ui/root-el';
import {createRoot, RootOptions} from 'react-dom/client';
import {Omit} from 'utility-types';
import './app.css';

declare module '@common/http/value-lists' {
  interface FetchValueListsResponse {
    genres: {value: string; name: string}[];
  }
}

declare module '@ui/settings/settings' {
  interface Settings extends Omit<BaseBackendSettings, 'uploads'> {
    spotify_is_setup?: boolean;
    lastfm_is_setup?: boolean;
    spotify_use_deprecated_api?: boolean;
    artist_provider?: string | false;
    album_provider?: string | false;
    search_provider?: string | false;
    artist_bio_provider?: string;
    wikipedia_language?: string;
    player?: {
      show_upload_btn?: boolean;
      default_volume?: number;
      hide_video_button?: boolean;
      hide_radio_button?: boolean;
      track_comments?: boolean;
      sort_method?: string;
      seekbar_type?: 'waveform' | 'bar';
      enable_repost?: boolean;
      hide_queue?: boolean;
      hide_video?: boolean;
      hide_lyrics?: boolean;
      lyrics_automate?: boolean;
      enable_download?: boolean;
      enable_offlining?: boolean;
      show_become_artist_btn?: boolean;
      default_artist_view?: 'list' | 'grid';
      mobile?: {
        auto_open_overlay?: boolean;
      };
    };
    uploads: {
      autoMatch?: boolean;
    };
    artistPage: {
      tabs: {id: string; active: boolean}[];
      showDescription?: boolean;
    };
    youtube?: {
      suggested_quality?: string;
      search_method?: string;
    };
    homepage: {
      type: string;
      value?: number | string;
    };
    landingPage?: {
      sections?: SectionConfig[];
    };
    ads?: {
      general_top?: string;
      general_bottom?: string;
      artist_top?: string;
      artist_bottom?: string;
      album_above?: string;
      disable?: boolean;
    };
  }
}

declare module '@ui/types/user' {
  interface User extends BaseBackendUser {
    artists?: UserArtist[];
  }
}

declare module '@ui/bootstrap-data/bootstrap-data' {
  interface BootstrapData extends BaseBackendBootstrapData {
    loaders?: {
      artist?: GetArtistResponse;
      artistPage?: GetArtistResponse;
      editArtistPage?: GetArtistResponse;
      album?: GetAlbumResponse;
      albumEmbed?: GetAlbumResponse;
      albumPage?: GetAlbumResponse;
      editAlbumPage?: GetAlbumResponse;
      track?: GetTrackResponse;
      trackPage?: GetTrackResponse;
      editTrackPage?: GetTrackResponse;
      playlistPage?: GetPlaylistResponse;
      playlist?: GetPlaylistResponse;
      userProfilePage?: {
        user: FullUserProfile;
        loader: 'userProfilePage';
      };
      searchPage?: SearchResponse;
      search?: SearchResponse;
      customPage?: FetchCustomPageResponse;
      landingPage?: {
        products: Product[];
        channels?: Channel[];
        sections?: SectionConfig[];
      };
    };
    playlists?: PartialPlaylist[];
    likes?: {
      [TRACK_MODEL]: Record<number, boolean>;
      [ALBUM_MODEL]: Record<number, boolean>;
      [ARTIST_MODEL]: Record<number, boolean>;
    };
    reposts?: {
      [TRACK_MODEL]: Record<number, boolean>;
      [ALBUM_MODEL]: Record<number, boolean>;
    };
  }
}

const data = getBootstrapData();
let options: RootOptions | undefined = undefined;
const sentryDsn = data.settings.logging.sentry_public;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.2,
    ignoreErrors: ignoredSentryErrors,
    release: data.sentry_release,
  });

  options = {
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
      console.warn('Uncaught error', error, errorInfo.componentStack);
    }),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  };
}

createRoot(rootEl, options).render(<CommonProvider router={appRouter} />);
