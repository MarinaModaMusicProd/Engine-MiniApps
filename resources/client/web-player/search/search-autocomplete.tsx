import {appQueries} from '@app/app-queries';
import {ALBUM_MODEL} from '@app/web-player/albums/album';
import {AlbumContextDialog} from '@app/web-player/albums/album-context-dialog';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink, getAlbumLink} from '@app/web-player/albums/album-link';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {ArtistContextDialog} from '@app/web-player/artists/artist-context-dialog';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink, getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PlayableModel} from '@app/web-player/playable-item/playable-model';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {PLAYLIST_MODEL} from '@app/web-player/playlists/playlist';
import {PlaylistContextDialog} from '@app/web-player/playlists/playlist-context-dialog';
import {PlaylistOwnerName} from '@app/web-player/playlists/playlist-grid-item';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {
  getPlaylistLink,
  PlaylistLink,
} from '@app/web-player/playlists/playlist-link';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {UserImage} from '@app/web-player/users/user-image';
import {
  getUserProfileLink,
  UserProfileLink,
} from '@app/web-player/users/user-profile-link';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {IconButton} from '@ui/buttons/icon-button';
import {ComboBox} from '@ui/forms/combobox/combobox';
import {Item} from '@ui/forms/listbox/item';
import {useListboxContext} from '@ui/forms/listbox/listbox-context';
import {Section} from '@ui/forms/listbox/section';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {USER_MODEL} from '@ui/types/user';
import clsx from 'clsx';
import {AnimatePresence, m} from 'framer-motion';
import {cloneElement, ReactElement, useState} from 'react';
import {useLocation, useParams} from 'react-router';

interface SearchAutocompleteProps {
  className?: string;
}
export function SearchAutocomplete({className}: SearchAutocompleteProps) {
  const {searchQuery} = useParams();
  const {trans} = useTrans();
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const isOnSearchPage = pathname.startsWith('/search/');
  const [query, setQuery] = useState(searchQuery || '');
  const [isOpen, setIsOpen] = useState(false);
  const {isFetching, data} = useQuery({
    ...appQueries.search.results('search', query),
    enabled: !!query && !isOnSearchPage,
    placeholderData: keepPreviousData,
  });
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const encodedQuery = encodeURIComponent(query.trim());
        if (encodedQuery) {
          setIsOpen(false);
          navigate(`/search/${encodedQuery}`);
        }
      }}
      className={clsx('flex flex-auto', className)}
    >
      <ComboBox
        className="w-full max-w-720 flex-auto"
        startAdornment={
          <IconButton type="submit" aria-label={trans(message('Search'))}>
            <SearchIcon />
          </IconButton>
        }
        offset={12}
        hideEndAdornment
        inputClassName="w-full outline-none placeholder:text-muted max-h-46"
        size="lg"
        isAsync
        inputRadius="rounded-button"
        inputShadow="shadow-sm"
        inputBorder="border border-divider-lighter"
        background="dark:bg-fg-base/10"
        placeholder={trans(message('Search songs, artists, albums, playlists'))}
        isLoading={isFetching}
        inputValue={query}
        onInputValueChange={setQuery}
        clearInputOnItemSelection
        blurReferenceOnItemSelection
        selectionMode="none"
        openMenuOnFocus
        floatingMaxHeight={670}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        autoFocusFirstItem={false}
      >
        {Object.entries(data?.results || {}).map(([groupName, results]) => (
          <Section key={groupName} label={<Trans message={groupName} />}>
            {results.data.map(result => {
              const key = `${groupName}-${result.id}`;
              switch (result.model_type) {
                case ARTIST_MODEL:
                  return (
                    <Item
                      key={key}
                      value={key}
                      onSelected={() => {
                        navigate(getArtistLink(result));
                      }}
                      startIcon={
                        <PlayableImage
                          model={result}
                          className="rounded-full"
                          value={key}
                        >
                          <SmallArtistImage artist={result} />
                        </PlayableImage>
                      }
                      description={<Trans message="Artist" />}
                      textLabel={result.name}
                    >
                      <DialogTrigger
                        type="popover"
                        mobileType="tray"
                        triggerOnContextMenu
                      >
                        <div>
                          <ArtistLink artist={result} />
                        </div>
                        <ArtistContextDialog artist={result} />
                      </DialogTrigger>
                    </Item>
                  );
                case ALBUM_MODEL:
                  return (
                    <Item
                      key={key}
                      value={key}
                      onSelected={() => {
                        navigate(getAlbumLink(result));
                      }}
                      startIcon={
                        <PlayableImage model={result} value={key}>
                          <AlbumImage album={result} />
                        </PlayableImage>
                      }
                      description={<ArtistLinks artists={result.artists} />}
                      textLabel={result.name}
                    >
                      <DialogTrigger
                        type="popover"
                        mobileType="tray"
                        triggerOnContextMenu
                      >
                        <div>
                          <AlbumLink album={result} />
                        </div>
                        <AlbumContextDialog album={result} />
                      </DialogTrigger>
                    </Item>
                  );
                case TRACK_MODEL:
                  return (
                    <Item
                      key={key}
                      value={key}
                      onSelected={() => {
                        navigate(getTrackLink(result));
                      }}
                      startIcon={
                        <PlayableImage model={result} value={key}>
                          <TrackImage track={result} />
                        </PlayableImage>
                      }
                      description={<ArtistLinks artists={result.artists} />}
                      textLabel={result.name}
                    >
                      <DialogTrigger
                        type="popover"
                        mobileType="tray"
                        triggerOnContextMenu
                      >
                        <div>
                          <TrackLink track={result} />
                        </div>
                        <TrackContextDialog tracks={[result]} />
                      </DialogTrigger>
                    </Item>
                  );
                case USER_MODEL:
                  return (
                    <Item
                      key={key}
                      value={key}
                      onSelected={() => {
                        navigate(getUserProfileLink(result));
                      }}
                      startIcon={
                        <UserImage className="h-48 w-48" user={result} />
                      }
                      description={
                        result.followers_count ? (
                          <Trans
                            message=":count followers"
                            values={{count: result.followers_count}}
                          />
                        ) : null
                      }
                      textLabel={result.name}
                    >
                      <UserProfileLink user={result} />
                    </Item>
                  );
                case PLAYLIST_MODEL:
                  return (
                    <Item
                      key={key}
                      value={key}
                      onSelected={() => {
                        navigate(getPlaylistLink(result));
                      }}
                      startIcon={
                        <PlayableImage model={result} value={key}>
                          <PlaylistImage playlist={result} />
                        </PlayableImage>
                      }
                      description={<PlaylistOwnerName playlist={result} />}
                      textLabel={result.name}
                    >
                      <DialogTrigger
                        type="popover"
                        mobileType="tray"
                        triggerOnContextMenu
                      >
                        <div>
                          <PlaylistLink playlist={result} />
                        </div>
                        <PlaylistContextDialog playlist={result} />
                      </DialogTrigger>
                    </Item>
                  );
              }
            })}
          </Section>
        ))}
      </ComboBox>
    </form>
  );
}

interface PlayableImageProps {
  children: ReactElement<{size: string; className?: string}>;
  model: PlayableModel;
  className?: string;
  value: string;
}
function PlayableImage({
  children,
  model,
  className,
  value,
}: PlayableImageProps) {
  const {
    collection,
    state: {activeIndex},
  } = useListboxContext();
  const index = collection.get(value)?.index;
  const isActive = activeIndex === index;

  const queueId = queueGroupId(model);
  const isPlaying = usePlayerStore(
    s => s.isPlaying && s.originalQueue[0]?.groupId === queueId,
  );

  return (
    <div
      className={clsx(className, 'relative h-48 w-48 overflow-hidden')}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {cloneElement(children, {
        size: 'w-full h-full',
      })}
      <AnimatePresence>
        {isActive || isPlaying ? (
          <m.div
            key="play-overlay"
            {...opacityAnimation}
            transition={{duration: 0.24}}
            className="absolute inset-0 m-auto flex h-full w-full items-center justify-center bg-black/60"
          >
            <PlaybackToggleButton
              buttonType="icon"
              color="white"
              equalizerColor="white"
              track={model.model_type === TRACK_MODEL ? model : undefined}
              queueId={queueId}
            />
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
