import {VirtualTableBody} from '@app/web-player/playlists/virtual-table-body';
import {Track} from '@app/web-player/tracks/track';
import {TrackListItem} from '@app/web-player/tracks/track-list/track-list-item';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {
  UseInfiniteQueryResult,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';

interface Props {
  tracks: Track[];
  query?: UseSuspenseInfiniteQueryResult | UseInfiniteQueryResult;
  totalTracks?: number;
}
export function TrackList({tracks, query, totalTracks}: Props) {
  const isMobile = useIsMobileMediaQuery();

  if (isMobile) {
    return (
      <TrackTable
        tracks={tracks}
        tableBody={
          <VirtualTableBody
            query={query ?? null}
            totalItems={query ? totalTracks : tracks.length}
          />
        }
      />
    );
  }

  return (
    <div>
      {tracks.map(track => (
        <TrackListItem
          queue={tracks}
          key={track.id}
          track={track}
          className="mb-40"
        />
      ))}
      {query ? <InfiniteScrollSentinel query={query} /> : null}
    </div>
  );
}
