import {Comment} from '@common/comments/comment';
import {AccountRequiredCard} from '@common/comments/comment-list/account-required-card';
import {CommentListItem} from '@common/comments/comment-list/comment-list-item';
import {commentQueries} from '@common/comments/comment-queries';
import {Commentable} from '@common/comments/commentable';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {useFlatInfiniteQueryItems} from '@common/ui/infinite-scroll/use-flat-infinite-query-items';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {CommentIcon} from '@ui/icons/material/Comment';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {Skeleton} from '@ui/skeleton/skeleton';
import {AnimatePresence, m} from 'framer-motion';
import {ReactNode, Suspense} from 'react';

const accountRequiredMessage = message(
  'Please <l>login</l> or <r>create account</r> to comment',
);

interface CommentListProps {
  commentable: Commentable;
  canDeleteAllComments?: boolean;
  className?: string;
  children?: ReactNode;
  perPage?: number;
}
export function CommentList({children, className, ...props}: CommentListProps) {
  return (
    <div className={className}>
      <AnimatePresence initial={false} mode="wait">
        <Suspense
          fallback={<CommentListSkeleton>{children}</CommentListSkeleton>}
        >
          <CommentListContent {...props}>{children}</CommentListContent>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}

function CommentListContent({
  commentable,
  canDeleteAllComments = false,
  children,
  perPage,
}: CommentListProps) {
  const query = useSuspenseInfiniteQuery(
    commentQueries.commentable(commentable).list(perPage),
  );
  const items = useFlatInfiniteQueryItems(query);
  const totalItems = query.data.pages[0]?.pagination?.total || 0;

  return (
    <>
      <Header>
        <Trans
          message=":count comments"
          values={{count: <FormattedNumber value={totalItems} />}}
        />
      </Header>
      {children}
      <AccountRequiredCard message={accountRequiredMessage} />
      <CommentListItems
        comments={items}
        canDeleteAllComments={canDeleteAllComments}
        commentable={commentable}
      />
      <InfiniteScrollSentinel query={query} variant="loadMore" />
    </>
  );
}

type HeaderProps = {
  children: ReactNode;
};
function Header({children}: HeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-8 border-b pb-8">
      <CommentIcon size="sm" className="text-muted" />
      {children}
    </div>
  );
}

interface CommentListItemsProps {
  comments: Comment[];
  canDeleteAllComments: boolean;
  commentable: Commentable;
}
function CommentListItems({
  comments,
  commentable,
  canDeleteAllComments,
}: CommentListItemsProps) {
  if (!comments.length) {
    return (
      <IllustratedMessage
        className="mt-24"
        size="sm"
        title={<Trans message="Seems a little quiet over here" />}
        description={<Trans message="Be the first to comment" />}
      />
    );
  }

  return (
    <m.div key="comments" {...opacityAnimation}>
      {comments.map(comment => (
        <CommentListItem
          key={comment.id}
          comment={comment}
          commentable={commentable}
          canDelete={canDeleteAllComments}
        />
      ))}
    </m.div>
  );
}

type CommentListSkeletonProps = {
  children: ReactNode;
};
function CommentListSkeleton({children}: CommentListSkeletonProps) {
  return (
    <>
      <Header>
        <Trans message="Loading comments..." />
      </Header>
      {children}
      <AccountRequiredCard message={accountRequiredMessage} />
      <CommentItemSkeletons count={4} />
    </>
  );
}

interface CommentItemSkeletonsProps {
  count: number;
}
function CommentItemSkeletons({count}: CommentItemSkeletonsProps) {
  return (
    <m.div key="loading-skeleton" {...opacityAnimation}>
      {[...new Array(count).keys()].map(index => (
        <div
          key={index}
          className="group flex min-h-70 items-start gap-24 py-18"
        >
          <Skeleton variant="avatar" radius="rounded-full" size="w-60 h-60" />
          <div className="flex-auto text-sm">
            <Skeleton className="mb-4 max-w-184 text-base" />
            <Skeleton className="text-sm" />
            <div className="mt-10 flex items-center gap-8">
              <Skeleton className="max-w-70 text-sm" />
              <Skeleton className="max-w-40 text-sm" />
              <Skeleton className="max-w-60 text-sm" />
            </div>
          </div>
        </div>
      ))}
    </m.div>
  );
}
