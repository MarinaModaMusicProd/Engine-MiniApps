import {Track} from '@app/web-player/tracks/track';
import {TrackTable} from '@app/web-player/tracks/track-table/track-table';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {useMemo, useState} from 'react';

interface TopTracksTableProps {
  tracks?: Track[];
}
export function TopTracksTable({tracks: initialTracks}: TopTracksTableProps) {
  const [showingAll, setShowingAll] = useState(false);

  const topTracks = useMemo(() => {
    return {
      all: initialTracks || [],
      sliced: initialTracks?.slice(0, 5) || [],
    };
  }, [initialTracks]);

  return (
    <div className="flex-auto">
      <h2 className="my-16 text-base text-muted">
        <Trans message="Popular songs" />
      </h2>
      <TrackTable
        tracks={showingAll ? topTracks.all : topTracks.sliced}
        hideAlbum
        hideHeaderRow
      />
      <Button
        radius="rounded-full"
        className="mt-20"
        variant="outline"
        onClick={() => {
          setShowingAll(!showingAll);
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
