<?php

namespace App\Http\Controllers;

use App\Models\Track;
use Common\Core\BaseController;
use Common\Files\FileEntry;
use Common\Files\Response\FileResponseFactory;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class DownloadLocalTrackController extends BaseController
{
    public function __construct(
        protected Track $track,
        protected FileEntry $fileEntry,
    ) {}

    public function download($id)
    {
        $track = $this->track->findOrFail($id);

        $this->authorize('download', $track);

        if (!$track->src) {
            abort(404);
        }

        // track is local
        if ($uploadedSrc = $track->uploadedSrc()->first()) {
            $ext = pathinfo($track->src, PATHINFO_EXTENSION);
            $trackName =
                str_replace('%', '', Str::ascii($track->name)) . ".$ext";
            $uploadedSrc->name = $trackName;

            return app(FileResponseFactory::class)->create(
                $uploadedSrc,
                'attachment',
            );

            // track is remote
        } else {
            $url = str_starts_with($track->src, 'https')
                ? $track->src
                : url($track->src);
            // need content-length for download progress
            $fileSize = null;

            // disable ssl certificate verification
            stream_context_set_default([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);
            $headers = @get_headers($url, 1) ?? [];
            $headers = array_change_key_case($headers, CASE_LOWER);
            $fileSize = $headers['content-length'] ?? null;
            $contentType = $headers['content-type'] ?? null;

            if (!$contentType || in_array($contentType, ['audio/mpegurl'])) {
                abort(406);
            }

            $response = response()->stream(function () use ($url) {
                echo file_get_contents($url);
            });

            $path = parse_url($url, PHP_URL_PATH);
            $extension = pathinfo($path, PATHINFO_EXTENSION) ?: 'mp3';

            $disposition = $response->headers->makeDisposition(
                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                "$track->name.$extension",
                str_replace('%', '', Str::ascii("$track->name.$extension")),
            );

            $responseHeaders = [
                'Content-Type' => $contentType,
                'Content-Disposition' => $disposition,
            ];

            if ($fileSize !== null) {
                $responseHeaders['Content-Length'] = $fileSize;
            }

            $response->headers->replace($responseHeaders);

            return $response;
        }
    }
}
