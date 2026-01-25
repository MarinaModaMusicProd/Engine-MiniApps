import {useUpdateTrackForm} from '@app/admin/tracks-datatable-page/crupdate/use-update-track-form';
import {TrackForm} from '@app/admin/tracks-datatable-page/track-form/track-form';
import {appQueries} from '@app/app-queries';
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';
import {Navigate, useLocation} from 'react-router';

interface Props {
  showExternalFields?: boolean;
  navbar?: ReactElement;
  breadcrumbs?: ReactElement;
}
export function Component({
  showExternalFields = true,
  navbar,
  breadcrumbs,
}: Props) {
  const {trackId} = useRequiredParams(['trackId']);
  const query = useSuspenseQuery(
    appQueries.tracks.get(trackId, 'editTrackPage'),
  );
  const track = query.data.track;

  const {canEdit} = useTrackPermissions([track]);
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const {form, updateTrack} = useUpdateTrackForm(track, {
    onTrackUpdated: response => {
      if (pathname.includes('admin')) {
        navigate('/admin/tracks');
      } else {
        navigate(getTrackLink(response.track));
      }
    },
  });

  if (!canEdit) {
    return <Navigate to="/" replace />;
  }

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        updateTrack.mutate(values);
      }}
      title={
        breadcrumbs ?? (
          <Breadcrumb size="xl">
            <BreadcrumbItem to={`/admin/tracks`}>
              <Trans message="Tracks" />
            </BreadcrumbItem>
            <BreadcrumbItem>{track.name}</BreadcrumbItem>
          </Breadcrumb>
        )
      }
      isLoading={updateTrack.isPending}
      disableSaveWhenNotDirty
      navbar={navbar}
    >
      <FileUploadProvider>
        <TrackForm showExternalIdFields={showExternalFields} />
      </FileUploadProvider>
    </CrupdateResourceLayout>
  );
}

export function BackstageUpdateTrackPage() {
  const {trackId} = useRequiredParams(['trackId']);
  const query = useSuspenseQuery(
    appQueries.tracks.get(trackId, 'editTrackPage'),
  );
  return (
    <div className="h-screen">
      <Component
        showExternalFields={false}
        navbar={
          <Navbar className="flex-shrink-0" color="bg" darkModeColor="bg" />
        }
        breadcrumbs={
          <Breadcrumb size="xl">
            <BreadcrumbItem to={getTrackLink(query.data.track)}>
              {query.data.track.name}
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Trans message="Edit" />
            </BreadcrumbItem>
          </Breadcrumb>
        }
      />
    </div>
  );
}
