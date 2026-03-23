import {BaseOfflineDb} from '@app/offline/base-offline-db';
import {Track} from '@app/web-player/tracks/track';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {extensionFromFilename} from '@ui/utils/files/extension-from-filename';

export type DownloadedFile = {
  size: number;
  contentType: string;
  extension: string;
  id: number;
  name: string;
  lastModified: number;
};

type DownloadProgress = {
  loaded: number;
  total: number | null;
  percentage: number | null;
};

export type ProgressCallback = (progress: DownloadProgress) => void;

class _DownloadedFiles extends BaseOfflineDb<DownloadedFile> {
  protected dbName = 'downloaded_files';
  protected dbVersion = 1;
  protected dbStoreName = 'files';

  async add(file: DownloadedFile): Promise<DownloadedFile | null> {
    if (await this.putItem(file)) {
      return file;
    }
    return null;
  }

  async getByTrackId(trackId: string | number): Promise<DownloadedFile | null> {
    return this.getItem(+trackId);
  }

  async delete(downloadedFile: DownloadedFile): Promise<boolean> {
    return this.deleteItem(downloadedFile.id);
  }

  async clear(): Promise<boolean> {
    return this.deleteAllItems();
  }
}

export const downloadedFiles = new _DownloadedFiles();

export async function downloadAndStoreTrackPlaybackData(
  track: Track,
  abortSignal: AbortSignal,
  onProgress: ProgressCallback,
): Promise<boolean> {
  const storageDir = await getStorageRoot();

  if (await playbackDataAlreadyExists(track.id)) {
    return true;
  }

  // download the playback data from backend
  const {blob, contentType} = await downloadData(
    track.id,
    abortSignal,
    onProgress,
  );

  const filename = `${track.id}`;

  // store downloaded data in opfs
  const fileHandle = await storageDir.getFileHandle(filename, {create: true});
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();

  // create a new entry in indexeddb for this download
  const entry = await downloadedFiles.add({
    id: +track.id,
    name: filename,
    size: blob.size,
    contentType: contentType,
    extension: guessExtension(track, contentType),
    lastModified: Date.now(),
  });

  return !!entry;
}

function guessExtension(track: Track, contentType: string): string {
  const fromFileName = extensionFromFilename(track.name);
  if (fromFileName) return fromFileName;

  // Strip parameters like "; codecs=opus"
  const mimeType = contentType.split(';')[0].trim().toLowerCase();
  const fromMap = mimeToExtensionMap[mimeType];
  if (fromMap) return fromMap;

  // Fallback: use the subtype part of the MIME type
  const subtype = mimeType.split('/')[1];
  if (subtype) return subtype;

  return 'mp3';
}

async function downloadData(
  trackId: string | number,
  abortSignal: AbortSignal,
  onProgress: ProgressCallback,
) {
  const url = `${getBootstrapData().settings.base_url}/tracks/${trackId}/download`;

  const response = await fetch(url, {signal: abortSignal});

  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to download track playback data: ${response.status} ${response.statusText}`,
    );
  }

  const contentLength = response.headers.get('content-length');
  const contentType = response.headers.get('content-type');
  const total = contentLength ? parseInt(contentLength, 10) : null;

  if (!contentLength || !contentType) {
    throw new Error(
      `Failed to download track playback data: ${response.status} ${response.statusText}`,
    );
  }

  const reader = response.body.getReader();
  const chunks: BlobPart[] = [];
  let loaded = 0;

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    if (value) {
      chunks.push(value);
      loaded += value.length;

      if (onProgress) {
        const percentage = total !== null ? (loaded / total) * 100 : null;
        onProgress({
          loaded,
          total,
          percentage,
        });
      }
    }
  }

  return {
    blob: new Blob(chunks),
    contentType: contentType,
  };
}

async function playbackDataAlreadyExists(
  trackId: string | number,
): Promise<boolean> {
  const entry = await downloadedFiles.getByTrackId(trackId);
  if (!entry) return false;

  try {
    const storageDir = await getStorageRoot();
    await storageDir.getFileHandle(entry.name, {create: false});
    return true;
  } catch (e: any) {
    if (e.name === 'NotFoundError') {
      return false;
    }

    throw e;
  }
}

const OFFLINE_PLAYBACK_DATA_DIR = 'offline-playback-data';

async function getStorageRoot(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return await root.getDirectoryHandle(OFFLINE_PLAYBACK_DATA_DIR, {
    create: true,
  });
}

export async function deleteTrackPlaybackData(
  trackId: string | number,
): Promise<boolean> {
  const entry = await downloadedFiles.getByTrackId(trackId);
  if (!entry) return true;

  try {
    await downloadedFiles.delete(entry);
    const storageDir = await getStorageRoot();
    await storageDir.removeEntry(entry.name);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      return true;
    }

    throw e;
  }
}

export async function clearPlaybackData(): Promise<boolean> {
  const handle = await navigator.storage.getDirectory();
  downloadedFiles.clear();
  try {
    await handle.removeEntry(OFFLINE_PLAYBACK_DATA_DIR, {recursive: true});
  } catch (e) {
    const notFound = e instanceof DOMException && e.name === 'NotFoundError';
    if (!notFound) {
      throw e;
    }
  }

  return true;
}

// only partial map for mimes that are plyable by the browser
const mimeToExtensionMap: Record<string, string> = {
  // Audio
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/aacp': 'aac',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
  'audio/x-flac': 'flac',

  // Video
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
};
