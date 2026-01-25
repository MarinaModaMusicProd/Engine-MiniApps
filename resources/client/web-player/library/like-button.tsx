import {Likeable} from '@app/web-player/library/likeable';
import {useAddItemsToLibrary} from '@app/web-player/library/requests/use-add-items-to-library';
import {useRemoveItemsFromLibrary} from '@app/web-player/library/requests/use-remove-items-from-library';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {Button, ButtonProps} from '@ui/buttons/button';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {FavoriteIcon} from '@ui/icons/material/Favorite';
import {FavoriteBorderIcon} from '@ui/icons/material/FavoriteBorder';

interface LikeButtonProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  likeable: Likeable;
}
export function LikeButton({
  likeable,
  radius = 'rounded-full',
  disabled,
  ...buttonProps
}: LikeButtonProps) {
  const authHandler = useAuthClickCapture();
  const addToLibrary = useAddItemsToLibrary();
  const removeFromLibrary = useRemoveItemsFromLibrary();
  const isLiked = useLibraryStore(s => s.has(likeable));
  const isLoading = addToLibrary.isPending || removeFromLibrary.isPending;
  const isOffline = useIsOffline();

  const labels = getLabels(likeable);

  const buttonIsDisabled = disabled || isLoading || isOffline;

  if (isLiked) {
    return (
      <Button
        {...buttonProps}
        variant="outline"
        radius={radius}
        startIcon={<FavoriteIcon className="text-primary" />}
        disabled={buttonIsDisabled}
        onClickCapture={authHandler}
        onClick={() => {
          removeFromLibrary.mutate({likeables: [likeable]});
        }}
      >
        <Trans {...labels.removeLike} />
      </Button>
    );
  }
  return (
    <Button
      {...buttonProps}
      variant="outline"
      radius={radius}
      startIcon={<FavoriteBorderIcon />}
      disabled={buttonIsDisabled}
      onClickCapture={authHandler}
      onClick={() => {
        addToLibrary.mutate({likeables: [likeable]});
      }}
    >
      <Trans {...labels.like} />
    </Button>
  );
}

function getLabels(likeable: Likeable) {
  switch (likeable.model_type) {
    case 'artist':
      return {like: message('Follow'), removeLike: message('Following')};
    default:
      return {like: message('Like'), removeLike: message('Liked')};
  }
}
