import {offlinedTracks} from '@app/offline/offlined-tracks';
import {MediaPageNoResultsMessage} from '@app/web-player/layout/media-page-no-results-message';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {Track} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {useAuth} from '@common/auth/use-auth';
import {TableDataItem} from '@common/ui/tables/types/table-data-item';
import {TextField} from '@ui/forms/input-field/text-field/text-field';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useFilter} from '@ui/i18n/use-filter';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {useEffect, useMemo, useState} from 'react';

export function Component() {
  const {trans} = useTrans();
  const {user} = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const queueId = queueGroupId(user!, 'libraryDownloadedTracks');
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (!isLoading) return;

    offlinedTracks
      .getAllDownloadedTracks()
      .then(offlinedTracks => {
        setTracks(offlinedTracks.map(offlinedTrack => offlinedTrack.data));
      })
      .finally(() => {
        setIsLoading(false);
      });

    const updateSub = offlinedTracks.listen('onItemUpdated', offlinedTrack => {
      setTracks(prevTracks => {
        const index = prevTracks.findIndex(
          track => track.id === offlinedTrack.id,
        );
        if (index !== -1) {
          prevTracks[index] = offlinedTrack.data;
        } else {
          prevTracks.push(offlinedTrack.data);
        }
        return [...prevTracks];
      });
    });

    const deleteSub = offlinedTracks.listen('onItemDeleted', offlinedTrack => {
      setTracks(prevTracks =>
        prevTracks.filter(track => track.id !== offlinedTrack.id),
      );
    });

    return () => {
      updateSub();
      deleteSub();
    };
  }, [isLoading]);

  const {contains} = useFilter({
    sensitivity: 'base',
  });
  const transformedTracks = useMemo(() => {
    return tracks.filter(
      item =>
        contains(item.name, searchQuery) ||
        item.artists?.some(a => a.name && contains(a.name, searchQuery)) ||
        (item.album?.name && contains(item.album.name, searchQuery)),
    );
  }, [tracks, searchQuery, contains]);

  return (
    <div className="mt-24">
      <div className="mb-24 flex items-center justify-between gap-24">
        <PlaybackToggleButton
          queueId={queueId}
          buttonType="text"
          className="min-w-128 flex-shrink-0"
          tracks={transformedTracks}
        />
        <TextField
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-512 flex-auto"
          size="sm"
          startAdornment={<SearchIcon />}
          placeholder={trans(message('Search within tracks'))}
        />
      </div>

      {!transformedTracks.length && !isLoading ? (
        <NoResultsMessage
          isFiltering={transformedTracks.length !== tracks.length}
        />
      ) : (
        <TrackTable
          queueGroupId={queueId}
          tracks={isLoading ? getPlaceholderItems() : transformedTracks}
          tableBody={
            <VirtualTableBody
              query={null}
              totalItems={transformedTracks.length}
            />
          }
        />
      )}
    </div>
  );
}

type NoResultsMessageProps = {
  isFiltering: boolean;
};
function NoResultsMessage({isFiltering}: NoResultsMessageProps) {
  return (
    <MediaPageNoResultsMessage
      className="mt-34"
      description={
        isFiltering ? (
          <Trans message="Try another search query or different filters." />
        ) : (
          <Trans message="You have not downloaded any songs yet." />
        )
      }
    />
  );
}

function getPlaceholderItems(): TableDataItem[] {
  return [...new Array(3).keys()].map(key => {
    return {
      isPlaceholder: true,
      id: `placeholder-${key}`,
    };
  });
}
