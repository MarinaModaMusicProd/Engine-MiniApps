import {CrupdateArtistForm} from '@app/admin/artist-datatable-page/artist-form/crupdate-artist-form';
import {
  UpdateArtistPayload,
  useUpdateArtist,
} from '@app/admin/artist-datatable-page/requests/use-update-artist';
import {appQueries} from '@app/app-queries';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {useArtistPermissions} from '@app/web-player/artists/use-artist-permissions';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
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
export function Component({
  showExternalFields = true,
  breadcrumbs,
  navbar,
}: Props) {
  const {artistId} = useRequiredParams(['artistId']);
  const query = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('editArtistPage'),
  );
  const artist = query.data.artist;

  const {canEdit} = useArtistPermissions(artist);
  const form = useForm<UpdateArtistPayload>({
    defaultValues: {
      id: artist.id,
      name: artist.name,
      verified: artist.verified,
      spotify_id: artist.spotify_id,
      genres: artist.genres,
      image_small: artist.image_small,
      links: artist.links,
      profile: artist.profile,
      profile_images: artist.profile_images,
      disabled: artist.disabled,
    },
  });
  const updateArtist = useUpdateArtist(form);

  if (!canEdit) {
    return <Navigate to="/" replace />;
  }

  return (
    <CrupdateResourceLayout
      form={form}
      onSubmit={values => {
        updateArtist.mutate(values);
      }}
      navbar={navbar}
      title={
        breadcrumbs ?? (
          <Breadcrumb size="xl">
            <BreadcrumbItem to="/admin/artists">
              <Trans message="Artists" />
            </BreadcrumbItem>
            <BreadcrumbItem>{artist.name}</BreadcrumbItem>
          </Breadcrumb>
        )
      }
      isLoading={updateArtist.isPending}
      disableSaveWhenNotDirty
    >
      <CrupdateArtistForm
        albums={query.data.albums?.data}
        showExternalFields={showExternalFields}
      />
    </CrupdateResourceLayout>
  );
}

export function BackstageUpdateArtistPage() {
  const {artistId} = useRequiredParams(['artistId']);
  const query = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('editArtistPage'),
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
            <BreadcrumbItem to={getArtistLink(query.data.artist)}>
              {query.data.artist.name}
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
