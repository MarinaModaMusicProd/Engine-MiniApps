import {
  OfflinedMediaItem,
  offlinedMediaItems,
} from '@app/offline/offline-media-items';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {LibraryPageSortDropdown} from '@app/web-player/library/library-page-sort-dropdown';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {PlayableMediaGridSkeleton} from '@app/web-player/playable-item/player-media-grid-skeleton';
import {FullPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistGridItem} from '@app/web-player/playlists/playlist-grid-item';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {useFilter} from '@ui/i18n/use-filter';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {sortArrayOfObjects} from '@ui/utils/array/sort-array-of-objects';
import {AnimatePresence, m} from 'framer-motion';
import {useEffect, useMemo, useState} from 'react';

type DownloadedMediaItemsTabProps = {
  sortItems: Record<string, MessageDescriptor>;
  type: 'album' | 'playlist';
};
export function DownloadedMediaItemsTab({
  sortItems,
  type,
}: DownloadedMediaItemsTabProps) {
  const {trans} = useTrans();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    orderBy: 'lastSyncedAt',
    orderDir: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<OfflinedMediaItem[]>([]);

  const {contains} = useFilter({
    sensitivity: 'base',
  });
  const transformedItems = useMemo(() => {
    const filteredItems = items.filter(item =>
      contains((item.data as FullAlbum | FullPlaylist).name, searchQuery),
    );
    return sortArrayOfObjects(
      filteredItems,
      sortDescriptor.orderBy!,
      sortDescriptor.orderDir!,
    );
  }, [items, searchQuery, sortDescriptor, contains]);

  useEffect(() => {
    if (!isLoading) return;

    (type === 'album'
      ? offlinedMediaItems.getAllAlbums()
      : offlinedMediaItems.getAllPlaylists()
    )
      .then(items => {
        setItems(items);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const updateSub = offlinedMediaItems.listen('onItemUpdated', item => {
      if (item.type !== type) {
        return;
      }
      setItems(prev => {
        const index = prev.findIndex(item => item.dbId === item.dbId);
        if (index !== -1) {
          prev[index] = item;
        } else {
          prev.push(item);
        }
        return [...prev];
      });
    });

    const deleteSub = offlinedMediaItems.listen('onItemDeleted', item => {
      if (item.type !== type) {
        return;
      }
      setItems(prev => prev.filter(item => item.dbId !== item.dbId));
    });

    return () => {
      updateSub();
      deleteSub();
    };
  }, [isLoading]);

  return (
    <div className="mt-34">
      <div className="flex items-center justify-between gap-24">
        <TextField
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-512 flex-auto"
          size="sm"
          startAdornment={<SearchIcon />}
          placeholder={trans(
            type === 'album'
              ? message('Search within albums')
              : message('Search within playlists'),
          )}
        />
        <LibraryPageSortDropdown
          items={sortItems}
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
        />
      </div>
      <div className="mt-34">
        <AnimatePresence initial={false} mode="wait">
          {isLoading ? (
            <PlayableMediaGridSkeleton itemCount={items.length} />
          ) : (
            <m.div key="media-grid" {...opacityAnimation}>
              <ContentGrid>
                {transformedItems.map(item =>
                  type === 'album' ? (
                    <AlbumGridItem
                      key={item.id}
                      album={item.data as FullAlbum}
                    />
                  ) : (
                    <PlaylistGridItem
                      key={item.id}
                      playlist={item.data as FullPlaylist}
                    />
                  ),
                )}
              </ContentGrid>
            </m.div>
          )}
        </AnimatePresence>
        {!transformedItems.length && !isLoading && (
          <NoResultsMessage
            type={type}
            isFiltering={items.length !== transformedItems.length}
          />
        )}
      </div>
    </div>
  );
}

type NoResultsMessageProps = {
  type: 'album' | 'playlist';
  isFiltering: boolean;
};
function NoResultsMessage({type, isFiltering}: NoResultsMessageProps) {
  if (isFiltering) {
    return (
      <MediaPageNoResultsMessage
        className="mt-34"
        description={
          <Trans message="Try another search query or different filters." />
        }
      />
    );
  }
  return (
    <MediaPageNoResultsMessage
      className="mt-34"
      description={
        type === 'album' ? (
          <Trans message="You have not downloaded any albums yet." />
        ) : (
          <Trans message="You have not downloaded any playlists yet." />
        )
      }
    />
  );
}
