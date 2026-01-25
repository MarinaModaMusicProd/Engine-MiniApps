import {PartialArtist} from '@app/web-player/artists/artist';
import {Genre} from '@app/web-player/genres/genre';
import {Track} from '@app/web-player/tracks/track';
import {BackendResponse} from '@common/http/backend-response/backend-response';

export type RadioSeed = PartialArtist | Track | Genre;

export interface RadioRecommendationsResponse extends BackendResponse {
  type: 'artist' | 'genre' | 'track';
  seed: RadioSeed;
  recommendations: Track[];
}
