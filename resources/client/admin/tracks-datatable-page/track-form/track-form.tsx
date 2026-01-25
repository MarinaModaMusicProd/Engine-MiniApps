import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {TrackFormUploadButton} from '@app/admin/tracks-datatable-page/track-form/track-form-upload-button';
import {UploadType} from '@app/site-config';
import {FormArtistPicker} from '@app/web-player/artists/artist-picker/form-artist-picker';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {FormNormalizedModelChipField} from '@common/tags/form-normalized-model-chip-field';
import {TAG_MODEL} from '@common/tags/tag';
import {FormNormalizedModelField} from '@common/ui/normalized-model/normalized-model-field';
import {FormImageSelector} from '@common/uploads/components/image-selector';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useSettings} from '@ui/settings/use-settings';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {ReactNode} from 'react';
import {useFormContext} from 'react-hook-form';

interface TrackFormProps {
  showExternalIdFields?: boolean;
  showAlbumField?: boolean;
  uploadButton?: ReactNode;
}
export function TrackForm({
  showExternalIdFields,
  showAlbumField = true,
  uploadButton,
}: TrackFormProps) {
  const {trans} = useTrans();
  const isMobile = useIsMobileMediaQuery();

  return (
    <div className="gap-24 md:flex">
      <div className="flex-shrink-0">
        <FormImageSelector
          name="image"
          uploadType={UploadType.artwork}
          variant={isMobile ? 'input' : 'square'}
          label={isMobile ? <Trans message="Image" /> : null}
          previewSize={isMobile ? undefined : 'w-full md:w-224 aspect-square'}
          stretchPreview
        />
        <div className="mt-24">
          {uploadButton ? uploadButton : <TrackFormUploadButton />}
        </div>
      </div>
      <div className="mt-24 flex-auto md:mt-0">
        <FormTextField
          name="name"
          label={<Trans message="Name" />}
          className="mb-24"
          required
          autoFocus
        />
        {showAlbumField && (
          <FormNormalizedModelField
            className="mb-24"
            label={<Trans message="Album" />}
            name="album_id"
            endpoint="search/suggestions/album"
          />
        )}
        <FormArtistPicker name="artists" className="mb-24" />
        <FormNormalizedModelChipField
          label={<Trans message="Genres" />}
          placeholder={trans(message('+Add genre'))}
          model={GENRE_MODEL}
          name="genres"
          allowCustomValue
          className="mb-24"
        />
        <FormNormalizedModelChipField
          label={<Trans message="Tags" />}
          placeholder={trans(message('+Add tag'))}
          model={TAG_MODEL}
          name="tags"
          allowCustomValue
          className="mb-24"
        />
        <FormTextField
          name="description"
          label={<Trans message="Description" />}
          inputElementType="textarea"
          rows={5}
          className="mb-24"
        />
        <DurationField />
        {showExternalIdFields && <SourceField />}
        {showExternalIdFields && <SpotifyIdField />}
      </div>
    </div>
  );
}

function SourceField() {
  return (
    <FormTextField
      name="src"
      label={<Trans message="Playback source" />}
      className="mb-24"
      minLength={1}
      maxLength={230}
      description={
        <Trans message="Supports audio, video, hls/dash stream and youtube video url. If left empty, best matching youtube video will be found automatically." />
      }
    />
  );
}

function SpotifyIdField() {
  const {spotify_is_setup} = useSettings();
  if (!spotify_is_setup) {
    return null;
  }
  return (
    <FormTextField
      name="spotify_id"
      label={<Trans message="Spotify ID" />}
      className="mb-24"
      minLength={22}
      maxLength={22}
    />
  );
}

function DurationField() {
  const {watch} = useFormContext<CreateTrackPayload>();
  return (
    <FormTextField
      required
      name="duration"
      label={<Trans message="Duration (in milliseconds)" />}
      className="mb-24"
      type="number"
      min={1}
      max={86400000}
      description={
        <Trans
          message="Will appear on the site as: :preview"
          values={{preview: <FormattedDuration ms={watch('duration')} />}}
        />
      }
    />
  );
}
