import {PartialAlbum} from '@app/web-player/albums/album';
import {useRepostsStore} from '@app/web-player/library/state/reposts-store';
import {useToggleRepost} from '@app/web-player/reposts/use-toggle-repost';
import {Track} from '@app/web-player/tracks/track';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {Button} from '@ui/buttons/button';
import {ButtonSize} from '@ui/buttons/button-size';
import {Trans} from '@ui/i18n/trans';
import {RepeatIcon} from '@ui/icons/material/Repeat';
import {useSettings} from '@ui/settings/use-settings';
import clsx from 'clsx';

interface RepostButtonProps {
  item: Track | PartialAlbum;
  className?: string;
  size?: ButtonSize;
  radius?: string;
  disabled?: boolean;
}
export function RepostButton({
  item,
  className,
  size = 'xs',
  radius,
  disabled,
}: RepostButtonProps) {
  const authHandler = useAuthClickCapture();
  const {player} = useSettings();
  const toggleRepost = useToggleRepost();
  const isReposted = useRepostsStore(s => s.has(item));
  const isOffline = useIsOffline();
  const buttonIsDisabled = disabled || toggleRepost.isPending || isOffline;
  if (!player?.enable_repost) return null;

  return (
    <Button
      className={className}
      variant="outline"
      size={size}
      radius={radius}
      startIcon={<RepeatIcon className={clsx(isReposted && 'text-primary')} />}
      disabled={buttonIsDisabled}
      onClickCapture={authHandler}
      onClick={() => toggleRepost.mutate({repostable: item})}
    >
      {isReposted ? <Trans message="Reposted" /> : <Trans message="Repost" />}
    </Button>
  );
}
