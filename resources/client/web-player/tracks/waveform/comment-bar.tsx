import {Track} from '@app/web-player/tracks/track';
import {CommentBarContext} from '@app/web-player/tracks/waveform/comment-bar-context';
import {useAuth} from '@common/auth/use-auth';
import {Comment} from '@common/comments/comment';
import {useInteractOutside} from '@react-aria/interactions';
import {Avatar} from '@ui/avatar/avatar';
import {useSlider} from '@ui/forms/slider/use-slider';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {useContext} from 'react';

interface CommentBarProps {
  comments: Comment[];
  track: Track;
}
export function CommentBar({comments, track}: CommentBarProps) {
  const {user, hasPermission} = useAuth();
  const {
    newCommentInputRef,
    newCommentPositionRef,
    markerIsVisible,
    setMarkerIsVisible,
    ...commentBarContext
  } = useContext(CommentBarContext);

  const disableCommenting =
    commentBarContext.disableCommenting || !hasPermission('comments.create');

  const {domProps, groupId, trackRef, getThumbPercent} = useSlider({
    onChange: () => {
      setMarkerIsVisible(true);
      newCommentPositionRef.current = getThumbPercent(0) * 100;
    },
    onChangeEnd: () => {
      newCommentInputRef.current?.focus();
    },
  });

  useInteractOutside({
    ref: trackRef,
    onInteractOutside: e => {
      if (!newCommentInputRef.current?.contains(e.target as HTMLElement)) {
        setMarkerIsVisible(false);
      }
    },
  });

  return (
    <div
      className={clsx(
        'absolute left-0 top-48 isolate h-26 w-full',
        !disableCommenting && 'cursor-pointer',
      )}
      ref={trackRef}
      {...(disableCommenting ? {} : domProps)}
      id={groupId}
    >
      {markerIsVisible ? (
        <div
          className="absolute left-0 top-0 z-20 h-26 w-26 -translate-x-1/2 cursor-move overflow-hidden shadow-md"
          style={{left: `${getThumbPercent(0) * 100}%`}}
        >
          <Avatar
            src={user?.image}
            label={user?.name}
            circle={false}
            size="w-full h-full"
          />
        </div>
      ) : null}
      {comments.map(comment => {
        if (!comment.user) return null;
        return (
          <DialogTrigger key={comment.id} type="popover" triggerOnHover>
            <div
              style={{left: `${Math.min(99, comment.position || 0)}%`}}
              className={clsx(
                'absolute top-0 -translate-x-1/2 cursor-pointer transition-opacity duration-300 ease-in-out',
                markerIsVisible ? 'opacity-40' : 'opacity-100',
              )}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded bg-fg-base/60 bg-cover shadow"
                style={{backgroundImage: `url(${comment.user.image})`}}
              >
                {!comment.user.image ? (
                  <Avatar
                    label={comment.user.name}
                    circle={false}
                    size="w-full h-full"
                  />
                ) : null}
              </div>
            </div>
            <CommentDialog comment={comment} />
          </DialogTrigger>
        );
      })}
    </div>
  );
}

interface CommentDialogProps {
  comment: Comment;
}
function CommentDialog({comment}: CommentDialogProps) {
  return (
    <Dialog size="w-auto">
      <DialogBody padding="p-8">
        <div className="flex items-center gap-10">
          {comment.user && (
            <div className="text-primary">{comment.user.name}</div>
          )}
          <div>{comment.content}</div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
