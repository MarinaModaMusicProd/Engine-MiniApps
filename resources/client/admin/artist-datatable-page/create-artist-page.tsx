import {CrupdateArtistForm} from '@app/admin/artist-datatable-page/artist-form/crupdate-artist-form';
import {
  CreateArtistPayload,
  useCreateArtist,
} from '@app/admin/artist-datatable-page/requests/use-create-artist';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {useForm} from 'react-hook-form';

export function Component() {
  const navigate = useNavigate();
  const form = useForm<CreateArtistPayload>();
  const createArtist = useCreateArtist(form);

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        createArtist.mutate(values, {
          onSuccess: response => {
            navigate(`../${response.artist.id}/edit`, {
              relative: 'path',
              replace: true,
            });
          },
        });
      }}
      title={
        <Breadcrumb size="xl">
          <BreadcrumbItem to="/admin/artists">
            <Trans message="Artists" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Trans message="New" />
          </BreadcrumbItem>
        </Breadcrumb>
      }
      isLoading={createArtist.isPending}
      disableSaveWhenNotDirty
    >
      <CrupdateArtistForm showExternalFields />
    </CrupdateResourceLayout>
  );
}
