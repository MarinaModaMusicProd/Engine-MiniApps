import {FullArtist} from '@app/web-player/artists/artist';
import {artistPageTabs} from '@app/web-player/artists/artist-page-tabs';
import {useSettings} from '@ui/settings/use-settings';
import {useMemo} from 'react';
import {useSearchParams} from 'react-router';

export function useArtistPageTabs(artist: FullArtist) {
  const [searchParams] = useSearchParams();
  const {artistPage} = useSettings();

  return useMemo(() => {
    const flippedArtistPageTabs = Object.fromEntries(
      Object.entries(artistPageTabs).map(([key, value]) => [value, key]),
    );
    const haveSimilar = artist.similar?.length;
    const haveBio =
      artist.profile_images?.length || artist.profile?.description;
    const activeTabs = artistPage?.tabs
      ?.filter(tab => {
        if (!tab.active) {
          return false;
        }
        if (tab.id === artistPageTabs.similar && !haveSimilar) {
          return false;
        }
        if (tab.id === artistPageTabs.about && !haveBio) {
          return false;
        }
        return true;
      })
      .map(tab => ({
        ...tab,
        name: flippedArtistPageTabs[tab.id] as keyof typeof artistPageTabs,
      }));
    const selectedTabId =
      artistPageTabs[searchParams.get('tab') as keyof typeof artistPageTabs];
    const i = activeTabs?.findIndex(t => t.id == selectedTabId);
    const selectedIndex = i > -1 ? i : 0;
    return {
      selectedIndex,
      activeTabs,
    };
  }, [artist, artistPage.tabs, searchParams]);
}
