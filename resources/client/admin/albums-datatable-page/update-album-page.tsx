import {AlbumForm} from '@app/admin/albums-datatable-page/album-form/album-form';
import {
  UpdateAlbumPayload,
  useUpdateAlbum,
} from '@app/admin/albums-datatable-page/requests/use-update-album';
import {appQueries} from '@app/app-queries';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {useAlbumPermissions} from '@app/web-player/albums/use-album-permissions';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {
  FileUploadProvider,
  useFileUploadStore,
} from '@common/uploads/uploader/file-upload-provider';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';
import {useForm} from 'react-hook-form';
import {Navigate} from 'react-router';

interface Props {
  showExternalFields?: boolean;
  breadcrumbs?: ReactElement;
  navbar?: ReactElement;
}
export function Component(props: Props) {
  return (
    <FileUploadProvider>
      <PageComponent {...props} />
    </FileUploadProvider>
  );
}

function PageComponent({
  showExternalFields = true,
  breadcrumbs,
  navbar,
}: Props) {
  const {albumId} = useRequiredParams(['albumId']);
  const query = useSuspenseQuery(
    appQueries.albums.get(albumId, 'editAlbumPage'),
  );
  const album = query.data.album;

  const {canEdit} = useAlbumPermissions(album);
  const uploadIsInProgress = !!useFileUploadStore(s => s.activeUploadsCount);
  const form = useForm<UpdateAlbumPayload>({
    defaultValues: {
      image: album.image,
      name: album.name,
      release_date: album.release_date,
      artists: album.artists,
      genres: album.genres,
      tags: album.tags,
      description: album.description,
      spotify_id: album.spotify_id,
      tracks: album.tracks,
    },
  });
  const updateAlbum = useUpdateAlbum(form, album.id);

  if (!canEdit) {
    return <Navigate to="/" replace />;
  }

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        updateAlbum.mutate(values);
      }}
      navbar={navbar}
      title={
        breadcrumbs ?? (
          <Breadcrumb size="xl">
            <BreadcrumbItem to="/admin/albums">
              <Trans message="Albums" />
            </BreadcrumbItem>
            <BreadcrumbItem>{album.name}</BreadcrumbItem>
          </Breadcrumb>
        )
      }
      isLoading={updateAlbum.isPending || uploadIsInProgress}
      disableSaveWhenNotDirty
    >
      <AlbumForm showExternalIdFields={showExternalFields} />
    </CrupdateResourceLayout>
  );
}

export function BackstageUpdateAlbumPage() {
  const {albumId} = useRequiredParams(['albumId']);
  const query = useSuspenseQuery(
    appQueries.albums.get(albumId, 'editAlbumPage'),
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
            <BreadcrumbItem to={getAlbumLink(query.data.album)}>
              {query.data.album.name}
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
