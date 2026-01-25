<?php

namespace Common\Comments;

class CommentToApiResource
{
    public function execute(Comment $comment, string|null $loader = null): array
    {
        $resource = [
            'id' => $comment->id,
            'content' => $comment->content,
            'user_id' => $comment->user_id,
            'depth' => $comment->depth,
            'deleted' => $comment->deleted,
            'position' => $comment->position,
            'upvotes' => $comment->upvotes,
            'downvotes' => $comment->downvotes,
            'score' => $comment->score,
            'model_type' => $comment->model_type,
            'created_at' => $comment->created_at?->toJSON(),
        ];

        if ($comment->relationLoaded('commentable')) {
            $resource[
                'commentable'
            ] = $comment->commentable->toNormalizedArray();
        }

        if ($comment->relationLoaded('user') && $comment->user) {
            $resource['user'] = [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'image' => $comment->user->image,
                'model_type' => $comment->user->model_type,
            ];

            if ($loader === 'commentDatatablePage') {
                $resource['user']['email'] = $comment->user->email;
            }
        }

        if ($comment->reports_count !== null) {
            $resource['reports_count'] = $comment->reports_count;
        }

        if ($comment->current_vote !== null) {
            $resource['current_vote'] = $comment->current_vote;
        }

        return $resource;
    }
}
