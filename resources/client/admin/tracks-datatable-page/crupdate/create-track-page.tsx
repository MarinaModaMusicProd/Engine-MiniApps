import {useCreateTrackForm} from '@app/admin/tracks-datatable-page/crupdate/use-create-track-form';
import {TrackForm} from '@app/admin/tracks-datatable-page/track-form/track-form';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Trans} from '@ui/i18n/trans';
import {useLocation} from 'react-router';

export function Component() {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const {form, createTrack} = useCreateTrackForm({
    onTrackCreated: response => {
      if (pathname.includes('admin')) {
        navigate(`/admin/tracks/${response.track.id}/edit`);
      } else {
        navigate(getTrackLink(response.track));
      }
    },
  });
  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        createTrack.mutate(values);
      }}
      title={<Trans message="Add new track" />}
      isLoading={createTrack.isPending}
      disableSaveWhenNotDirty
    >
      <FileUploadProvider>
        <TrackForm showExternalIdFields />
      </FileUploadProvider>
    </CrupdateResourceLayout>
  );
}
