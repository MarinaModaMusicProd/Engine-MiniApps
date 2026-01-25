import {getArtistLink} from '@app/web-player/artists/artist-link';
import {usePrimaryArtistForCurrentUser} from '@app/web-player/backstage/use-primary-artist-for-current-user';
import {SearchAutocomplete} from '@app/web-player/search/search-autocomplete';
import {useAuth} from '@common/auth/use-auth';
import {DashboardNavbar} from '@common/ui/dashboard-layout/dashboard-navbar';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {MicIcon} from '@ui/icons/material/Mic';
import {MenuItem} from '@ui/menu/menu-trigger';
import {useSettings} from '@ui/settings/use-settings';
import {Fragment, useMemo} from 'react';
import {Link} from 'react-router';

export function PlayerNavbar() {
  const navigate = useNavigate();
  const primaryArtist = usePrimaryArtistForCurrentUser();
  const {player} = useSettings();
  const menuItems = useMemo(() => {
    if (primaryArtist) {
      return [
        <MenuItem
          value="author"
          key="author"
          startIcon={<MicIcon />}
          onSelected={() => {
            navigate(getArtistLink(primaryArtist));
          }}
        >
          <Trans message="Artist profile" />
        </MenuItem>,
      ];
    }
    if (player?.show_become_artist_btn) {
      return [
        <MenuItem
          value="author"
          key="author"
          startIcon={<MicIcon />}
          onSelected={() => {
            navigate('/backstage/requests');
          }}
        >
          <Trans message="Become an author" />
        </MenuItem>,
      ];
    }

    return [];
  }, [primaryArtist, navigate, player?.show_become_artist_btn]);

  return (
    <DashboardNavbar
      color="transparent"
      darkModeColor="transparent"
      logoColor="matchMode"
      border="border-none"
      textColor="text-main"
      size={null}
      className="my-8"
      authMenuItems={menuItems}
    >
      <SearchAutocomplete className="ml-44" />
      <ActionButtons />
    </DashboardNavbar>
  );
}

function ActionButtons() {
  const {player, billing} = useSettings();
  const {isLoggedIn, hasPermission, isSubscribed} = useAuth();

  const showUploadButton =
    player?.show_upload_btn && isLoggedIn && hasPermission('music.create');
  const showTryProButton = billing?.enable && !isSubscribed;

  return (
    <Fragment>
      {showTryProButton ? (
        <Button
          variant="outline"
          size="xs"
          color="primary"
          elementType={Link}
          to="/pricing"
        >
          <Trans message="Try Pro" />
        </Button>
      ) : null}
      {showUploadButton ? (
        <Button
          variant={showTryProButton ? 'text' : 'outline'}
          size="xs"
          color={showTryProButton ? undefined : 'primary'}
          elementType={Link}
          to="/backstage/upload"
        >
          <Trans message="Upload" />
        </Button>
      ) : null}
    </Fragment>
  );
}
