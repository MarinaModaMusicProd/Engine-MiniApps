import {commentQueries} from '@common/comments/comment-queries';
import {useRestoreComments} from '@common/comments/requests/use-restore-comments';
import {queryClient} from '@common/http/query-client';
import {Button} from '@ui/buttons/button';
import {ButtonSize} from '@ui/buttons/button-size';
import {ButtonVariant} from '@ui/buttons/get-shared-button-style';
import {Trans} from '@ui/i18n/trans';

interface Props {
  commentIds: number[];
  variant?: ButtonVariant;
  size?: ButtonSize;
}
export function RestoreCommentsButton({
  commentIds,
  variant = 'outline',
  size = 'xs',
}: Props) {
  const restoreComments = useRestoreComments();
  return (
    <Button
      variant={variant}
      size={size}
      className="mr-10"
      disabled={restoreComments.isPending}
      color="primary"
      onClick={() => {
        restoreComments.mutate(
          {commentIds},
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: commentQueries.invalidateKey,
              });
            },
          },
        );
      }}
    >
      <Trans message="Restore" />
    </Button>
  );
}
