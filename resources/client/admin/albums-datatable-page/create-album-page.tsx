import {AlbumForm} from '@app/admin/albums-datatable-page/album-form/album-form';
import {
  CreateAlbumPayload,
  useCreateAlbum,
} from '@app/admin/albums-datatable-page/requests/use-create-album';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useNormalizedModel} from '@common/ui/normalized-model/use-normalized-model';
import {
  FileUploadProvider,
  useFileUploadStore,
} from '@common/uploads/uploader/file-upload-provider';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {useCurrentDateTime} from '@ui/i18n/use-current-date-time';
import {ReactElement, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useLocation, useSearchParams} from 'react-router';

interface Props {
  breadcrumbs?: ReactElement;
  navbar?: ReactElement;
}
export function Component({breadcrumbs, navbar}: Props) {
  return (
    <FileUploadProvider>
      <PageContent breadcrumbs={breadcrumbs} navbar={navbar} />
    </FileUploadProvider>
  );
}

function PageContent({breadcrumbs, navbar}: Props) {
  const uploadIsInProgress = !!useFileUploadStore(s => s.activeUploadsCount);
  const now = useCurrentDateTime();
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const [searchParams] = useSearchParams();
  const {data} = useNormalizedModel(
    `normalized-models/artist/${searchParams.get('artistId')}`,
    undefined,
    {enabled: !!searchParams.get('artistId')},
  );
  const artist = data?.model;
  const form = useForm<CreateAlbumPayload>({
    defaultValues: {
      release_date: now.toAbsoluteString(),
    },
  });
  const createAlbum = useCreateAlbum(form);

  useEffect(() => {
    if (artist) {
      form.reset({
        artists: [artist],
      });
    }
  }, [artist, form]);

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        createAlbum.mutate(values, {
          onSuccess: response => {
            if (pathname.includes('admin')) {
              if (artist) {
                navigate(`/admin/artists/${artist.id}/edit`);
              } else {
                navigate('/admin/albums');
              }
            } else {
              navigate(getAlbumLink(response.album));
            }
          },
        });
      }}
      title={
        breadcrumbs ?? (
          <Breadcrumb size="xl">
            <BreadcrumbItem to="/admin/albums">
              <Trans message="Albums" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Trans message="New" />
            </BreadcrumbItem>
          </Breadcrumb>
        )
      }
      isLoading={createAlbum.isPending || uploadIsInProgress}
      disableSaveWhenNotDirty
      navbar={navbar}
    >
      <AlbumForm showExternalIdFields />
    </CrupdateResourceLayout>
  );
}

export function BackstageCreateAlbumPage() {
  const [searchParams] = useSearchParams();
  return (
    <div className="h-screen">
      <Component
        navbar={
          <Navbar className="flex-shrink-0" color="bg" darkModeColor="bg" />
        }
        breadcrumbs={
          <Breadcrumb size="xl">
            <BreadcrumbItem
              to={`/backstage/artists/${searchParams.get('artistId')}/edit`}
            >
              <Trans message="Backstage" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Trans message="New album" />
            </BreadcrumbItem>
          </Breadcrumb>
        }
      />
    </div>
  );
}
