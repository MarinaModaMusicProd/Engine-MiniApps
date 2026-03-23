import {ArtistPageSubtitle} from '@app/web-player/artists/artist-page/artist-page-subtitle';
import {Track} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {getScrollParent} from '@react-aria/utils';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {useMemo, useRef, useState} from 'react';

interface TopTracksTableProps {
  tracks?: Track[];
}
export function TopTracksTable({tracks: initialTracks}: TopTracksTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showingAll, setShowingAll] = useState(false);

  const topTracks = useMemo(() => {
    return {
      all: initialTracks || [],
      sliced: initialTracks?.slice(0, 5) || [],
    };
  }, [initialTracks]);

  return (
    <div className="mt-34 flex-auto" ref={containerRef}>
      <ArtistPageSubtitle>
        <Trans message="Top tracks" />
      </ArtistPageSubtitle>
      <TrackTable
        tracks={showingAll ? topTracks.all : topTracks.sliced}
        hideHeaderRow
      />
      <Button
        radius="rounded-full"
        className="mt-20"
        variant="outline"
        onClick={() => {
          if (showingAll) {
            setShowingAll(false);
            if (containerRef.current) {
              const scrollParent = getScrollParent(containerRef.current!);
              if (scrollParent) {
                scrollParent.scrollTo({
                  top: 0,
                  behavior: 'instant',
                });
              }
            }
          } else {
            setShowingAll(true);
          }
        }}
      >
        {showingAll ? (
          <Trans message="Show less" />
        ) : (
          <Trans message="Show more" />
        )}
      </Button>
    </div>
  );
}
