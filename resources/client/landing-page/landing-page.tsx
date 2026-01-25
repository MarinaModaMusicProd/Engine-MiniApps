import {ChannelContentModel} from '@app/admin/channels/channel-content-config';
import {appQueries} from '@app/app-queries';
import {ALBUM_MODEL} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink, getAlbumLink} from '@app/web-player/albums/album-link';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink, getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PLAYLIST_MODEL} from '@app/web-player/playlists/playlist';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {
  getPlaylistLink,
  PlaylistLink,
} from '@app/web-player/playlists/playlist-link';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {UserImage} from '@app/web-player/users/user-image';
import {
  getUserProfileLink,
  UserProfileLink,
} from '@app/web-player/users/user-profile-link';
import {Channel} from '@common/channels/channel';
import {LandingPage as CommonLandingPage} from '@common/ui/landing-page/landing-page';
import {LandingPageContext} from '@common/ui/landing-page/landing-page-context';
import {useSuspenseQuery} from '@tanstack/react-query';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {AnalyticsIcon} from '@ui/icons/material/Analytics';
import {DynamicFeedIcon} from '@ui/icons/material/DynamicFeed';
import {HelpOutlineIcon} from '@ui/icons/material/HelpOutline';
import {HighQualityIcon} from '@ui/icons/material/HighQuality';
import {InsightsIcon} from '@ui/icons/material/Insights';
import {LightbulbIcon} from '@ui/icons/material/Lightbulb';
import {MessageIcon} from '@ui/icons/material/Message';
import {NotificationsIcon} from '@ui/icons/material/Notifications';
import {OfflinePinIcon} from '@ui/icons/material/OfflinePin';
import {PersonIcon} from '@ui/icons/material/Person';
import {PlaylistPlayIcon} from '@ui/icons/material/PlaylistPlay';
import {PublicIcon} from '@ui/icons/material/Public';
import {PublishIcon} from '@ui/icons/material/Publish';
import {RepeatIcon} from '@ui/icons/material/Repeat';
import {SearchIcon} from '@ui/icons/material/Search';
import {WavesIcon} from '@ui/icons/material/Waves';
import {USER_MODEL} from '@ui/types/user';
import clsx from 'clsx';
import {cloneElement, ComponentType, ReactElement, ReactNode} from 'react';
import {Link, useNavigate} from 'react-router';

const defaultIcons = {
  search: SearchIcon,
  highQuality: HighQualityIcon,
  analytics: AnalyticsIcon,
  community: PublicIcon,
  discover: LightbulbIcon,
  person: PersonIcon,
  help: HelpOutlineIcon,
  publish: PublishIcon,
  insights: InsightsIcon,
  repeat: RepeatIcon,
  feed: DynamicFeedIcon,
  playlist: PlaylistPlayIcon,
  offline: OfflinePinIcon,
  waves: WavesIcon,
  message: MessageIcon,
  notifications: NotificationsIcon,
};

const sectionRenderers: Record<
  string,
  ComponentType<{config: ChannelSectionProps['config']; index: number}>
> = {
  channel: ChannelSection,
};

type HeroSearchBarProps = {
  background?: string;
};
function HeroSearchBar({background}: HeroSearchBarProps) {
  const navigate = useNavigate();
  const {trans} = useTrans();

  return (
    <form
      className="w-full"
      onSubmit={e => {
        e.preventDefault();
        navigate(`search/${(e.currentTarget[0] as HTMLInputElement).value}`);
      }}
    >
      <TextField
        background={background}
        inputRadius="rounded-full"
        size="lg"
        placeholder={trans(message('Search for artists, albums, songs...'))}
        startAdornment={<SearchIcon />}
        adornmentPosition="left-10"
      />
    </form>
  );
}

export function Component() {
  const query = useSuspenseQuery(appQueries.landingPageData.get());
  return (
    <LandingPageContext.Provider
      value={{
        defaultIcons,
        sections: query.data.sections ?? [],
        sectionRenderers,
        heroSearchBarSlot: HeroSearchBar,
      }}
    >
      <CommonLandingPage />
    </LandingPageContext.Provider>
  );
}

type ChannelSectionProps = {
  config: {
    channelId?: number | string;
    badge?: string;
    title?: string;
    description?: string;
  };
};
function ChannelSection({config}: ChannelSectionProps) {
  const query = useSuspenseQuery(appQueries.landingPageData.get());
  const channel = query.data.channels?.find(
    c => c.id == config.channelId,
  ) as Channel<ChannelContentModel>;

  if (!channel) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-24 py-96 @container sm:py-128 lg:px-32">
      <div className="mx-auto max-w-2xl lg:text-center">
        {config.badge ? (
          <p className="text-base/7 font-semibold text-primary">
            <Trans message={config.badge} />
          </p>
        ) : null}
        {config.title ? (
          <h2 className="mt-8 text-pretty text-4xl font-semibold tracking-tight text-main sm:text-5xl lg:text-balance">
            <Trans message={config.title} />
          </h2>
        ) : null}
        {config.description ? (
          <p className="mt-24 text-lg/8 text-muted">
            <Trans message={config.description} />
          </p>
        ) : null}
      </div>
      <div className="relative mt-64 sm:mt-80 lg:mt-96">
        <div className="compact-scrollbar overflow-x-auto">
          <div className="grid min-w-[1067px] grid-cols-5 grid-rows-2 gap-24">
            {channel.content?.data.map(item => (
              <GridItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-68 bg-gradient-to-l from-bg to-transparent xl:hidden" />
      </div>
    </div>
  );
}

function GridItem({item}: {item: ChannelContentModel}) {
  switch (item.model_type) {
    case ARTIST_MODEL:
      return (
        <GridItemLayout
          image={<SmallArtistImage artist={item} />}
          radius="rounded-full"
          title={<ArtistLink artist={item} />}
          link={getArtistLink(item)}
        />
      );
    case ALBUM_MODEL:
      return (
        <GridItemLayout
          image={<AlbumImage album={item} />}
          radius="rounded-panel"
          title={<AlbumLink album={item} />}
          description={<ArtistLinks artists={item.artists} />}
          link={getAlbumLink(item)}
        />
      );
    case TRACK_MODEL:
      return (
        <GridItemLayout
          image={<TrackImage track={item} />}
          radius="rounded-panel"
          title={<TrackLink track={item} />}
          description={<ArtistLinks artists={item.artists} />}
          link={getTrackLink(item)}
        />
      );
    case PLAYLIST_MODEL:
      const owner = item.editors[0];
      const playlistDescription = owner ? (
        <Trans
          message="By :name"
          values={{
            name: <UserProfileLink user={owner} />,
          }}
        />
      ) : null;
      return (
        <GridItemLayout
          image={<PlaylistImage playlist={item} />}
          radius="rounded-panel"
          title={<PlaylistLink playlist={item} />}
          description={playlistDescription}
          link={getPlaylistLink(item)}
        />
      );
    case USER_MODEL:
      const userDescription = item.followers_count ? (
        <Trans
          message=":count followers"
          values={{count: item.followers_count}}
        />
      ) : null;
      return (
        <GridItemLayout
          image={<UserImage user={item} />}
          radius="rounded-panel"
          title={<UserProfileLink user={item} />}
          description={userDescription}
          link={getUserProfileLink(item)}
        />
      );
    default:
      return null;
  }
}

type GridItemLayoutProps = {
  image: ReactElement<{size: string; className?: string}>;
  radius: string;
  title: ReactNode;
  description?: ReactNode;
  link: string;
};
function GridItemLayout({
  image,
  radius,
  title,
  description,
  link,
}: GridItemLayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="snap-start snap-normal">
      <div className="group relative isolate w-full">
        <Link className="block aspect-square w-full cursor-pointer" to={link}>
          {cloneElement(image, {
            size: 'w-full h-full',
            className: `${radius} shadow-md z-10`,
          })}
        </Link>
      </div>
      <div
        className={clsx(
          radius === 'rounded-full' && 'text-center',
          'mt-12 text-sm',
        )}
      >
        <div className="line-clamp-2 overflow-ellipsis">{title}</div>
        <div className="mt-4 overflow-hidden overflow-ellipsis whitespace-nowrap text-muted">
          {description}
        </div>
      </div>
    </div>
  );
}
