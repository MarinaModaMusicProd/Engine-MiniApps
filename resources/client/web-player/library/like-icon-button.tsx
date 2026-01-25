import {Likeable} from '@app/web-player/library/likeable';
import {useAddItemsToLibrary} from '@app/web-player/library/requests/use-add-items-to-library';
import {useRemoveItemsFromLibrary} from '@app/web-player/library/requests/use-remove-items-from-library';
import {useLibraryStore} from '@app/web-player/library/state/likes-store';
import {useAuthClickCapture} from '@app/web-player/use-auth-click-capture';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {IconButton, IconButtonProps} from '@ui/buttons/icon-button';
import {FavoriteIcon} from '@ui/icons/material/Favorite';
import {FavoriteBorderIcon} from '@ui/icons/material/FavoriteBorder';

interface LikeIconButtonProps
  extends Omit<IconButtonProps, 'children' | 'disabled' | 'onClick'> {
  likeable: Likeable;
}
export function LikeIconButton({
  likeable,
  size = 'sm',
  ...buttonProps
}: LikeIconButtonProps) {
  const authHandler = useAuthClickCapture();
  const addToLibrary = useAddItemsToLibrary();
  const removeFromLibrary = useRemoveItemsFromLibrary();
  const isLiked = useLibraryStore(s => s.has(likeable));
  const isLoading = addToLibrary.isPending || removeFromLibrary.isPending;
  const isOffline = useIsOffline();
  const isDisabled = isLoading || isOffline;

  if (isLiked) {
    return (
      <IconButton
        {...buttonProps}
        size={size}
        color="primary"
        disabled={isDisabled}
        onClickCapture={authHandler}
        onClick={e => {
          e.stopPropagation();
          removeFromLibrary.mutate({likeables: [likeable]});
        }}
      >
        <FavoriteIcon />
      </IconButton>
    );
  }
  return (
    <IconButton
      {...buttonProps}
      size={size}
      disabled={isDisabled}
      onClickCapture={authHandler}
      onClick={e => {
        e.stopPropagation();
        addToLibrary.mutate({likeables: [likeable]});
      }}
    >
      <FavoriteBorderIcon />
    </IconButton>
  );
}
