import {invalidateWaveData} from '@app/web-player/tracks/requests/use-track-wave-data';
import {CommentBarContext} from '@app/web-player/tracks/waveform/comment-bar-context';
import {useAuth} from '@common/auth/use-auth';
import {
  NewCommentForm,
  NewCommentFormProps,
} from '@common/comments/new-comment-form';
import {useContext} from 'react';

export function CommentBarNewCommentForm({
  commentable,
  className,
}: NewCommentFormProps) {
  const {isLoggedIn} = useAuth();
  const {newCommentInputRef, newCommentPositionRef, setMarkerIsVisible} =
    useContext(CommentBarContext);

  if (!isLoggedIn) return null;

  return (
    <NewCommentForm
      inputRef={newCommentInputRef}
      className={className}
      commentable={commentable}
      payload={{position: newCommentPositionRef.current}}
      onSuccess={() => {
        setMarkerIsVisible(false);
        invalidateWaveData(commentable.id);
      }}
    />
  );
}
