<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Common\Comments\Comment;
use Common\Core\BaseController;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WaveController extends BaseController
{
    public function __construct(
        protected Request $request,
        protected Track $track,
    ) {}

    public function show(Track $track)
    {
        $this->authorize('show', $track);

        try {
            $isDemoSite = config('app.demo');
            if ($isDemoSite && Str::startsWith($track->src, 'tracks/')) {
                preg_match_all('!\d+!', $track->src, $matches);
                $demoWaveNum = $matches[0][0];
                $waveData = json_decode(
                    file_get_contents(public_path("waves/{$demoWaveNum}.json")),
                    true,
                );
            } else {
                $waveData = json_decode(
                    $this->track
                        ->getWaveStorageDisk()
                        ->get("waves/$track->id.json"),
                    true,
                );
            }
        } catch (FileNotFoundException $e) {
            $waveData = [];
        }

        $latestPositions = Comment::select(
            'position',
            DB::raw('MAX(created_at) as latest_created_at'),
        )
            ->where('commentable_id', $track->id)
            ->where('commentable_type', Track::MODEL_TYPE)
            ->groupBy('position');

        $comments = Comment::query()
            ->with('user')
            ->joinSub($latestPositions, 'latest', function ($join) {
                $join
                    ->on('comments.position', '=', 'latest.position')
                    ->on(
                        'comments.created_at',
                        '=',
                        'latest.latest_created_at',
                    );
            })
            ->where('comments.commentable_id', $track->id)
            ->where('comments.commentable_type', Track::MODEL_TYPE)
            ->orderBy('comments.position')
            ->limit(30)
            ->get();

        return $this->success([
            'waveData' => $waveData,
            'comments' => $comments,
        ]);
    }
}
