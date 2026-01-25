import {BackstageRequestType} from '@app/admin/backstage-requests-datatable-page/backstage-request-type';
import {BackstageRequestViewerHeader} from '@app/admin/backstage-requests-datatable-page/viewer/backstage-request-viewer-header';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {useBackstageRequest} from '@app/web-player/backstage/requests/use-backstage-request';
import {UserAvatar} from '@common/auth/user-avatar';
import {PageStatus} from '@common/http/page-status';
import {Button} from '@ui/buttons/button';
import {LinkStyle} from '@ui/buttons/external-link';
import {Trans} from '@ui/i18n/trans';
import {DocumentScannerIcon} from '@ui/icons/material/DocumentScanner';
import {FacebookIcon} from '@ui/icons/social/facebook';
import {TwitterIcon} from '@ui/icons/social/twitter';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {ImageZoomDialog} from '@ui/overlays/dialog/image-zoom-dialog';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {cloneElement, ReactElement, ReactNode} from 'react';

export function Component() {
  const query = useBackstageRequest();

  if (query.data) {
    return (
      <div className="flex h-full flex-col">
        <BackstageRequestViewerHeader request={query.data.request} />
        <div className="container mx-auto flex-auto overflow-y-auto p-24">
          <RequestDetails request={query.data.request} />
          <VerificationList request={query.data.request} />
        </div>
      </div>
    );
  }

  return <PageStatus query={query} />;
}

interface RequestDetailsProps {
  request: BackstageRequest;
}
function RequestDetails({request}: RequestDetailsProps) {
  return (
    <div className="mt-60">
      <div className="mb-14 mt-24 text-2xl">
        <Trans message="Request details" />
      </div>
      <div>
        <Detail
          name={<Trans message="Image" />}
          value={
            request.data.image ? (
              <img
                src={request.data.image || request.artist?.image_small}
                className="max-h-100 rounded"
                alt=""
              />
            ) : null
          }
        />
        <Detail
          name={<Trans message="Type" />}
          value={<BackstageRequestType type={request.type} />}
        />
        <Detail
          name={<Trans message="Requester" />}
          value={
            <div className="flex items-center gap-8">
              <UserAvatar user={request.user} />
              {request.user.name}
            </div>
          }
        />
        {request.artist && (
          <Detail
            name={<Trans message="Artist" />}
            value={
              <div className="flex w-max items-center gap-12">
                <SmallArtistImage
                  artist={request.artist}
                  className="flex-shrink-0 rounded"
                  size="w-32 h-32"
                />
                <ArtistLink artist={request.artist} />
              </div>
            }
          />
        )}
        <Detail
          name={<Trans message="Requested artist name" />}
          value={<BackstageRequestType type={request.artist_name} />}
        />
        <Detail
          name={<Trans message="Requested role" />}
          value={
            request.data.role ? (
              <Trans message={request.data.role} />
            ) : undefined
          }
        />
        <Detail name={<Trans message="Name" />} value={request.data.name} />
        <Detail
          name={<Trans message="Company" />}
          value={request.data.company}
        />
      </div>
    </div>
  );
}

interface DetailProps {
  name: ReactNode;
  value: ReactNode;
}
function Detail({name, value}: DetailProps) {
  return (
    <div className="items-center gap-24 border-b py-12 text-sm md:flex md:py-18">
      <div className="mb-8 min-w-200 md:mb-0">{name}</div>
      <div>{value}</div>
    </div>
  );
}

function VerificationList({request}: RequestDetailsProps) {
  return (
    <div className="mt-60">
      <div className="mb-14 mt-24 text-2xl">
        <Trans message="Attached verification" />
      </div>
      <div>
        {request.data.passport_scan_entry && (
          <VerificationListItem
            icon={<DocumentScannerIcon />}
            title={<Trans message="Passport scan" />}
            description={`${
              request.data.passport_scan_entry.name
            } (${prettyBytes(request.data.passport_scan_entry.file_size)})`}
            action={
              <DialogTrigger type="modal">
                <Button variant="outline" color="primary" size="xs">
                  <Trans message="View" />
                </Button>
                <ImageZoomDialog image={request.data.passport_scan_entry.url} />
              </DialogTrigger>
            }
          />
        )}
        <SocialServiceVerification request={request} service="twitter" />
        <SocialServiceVerification request={request} service="facebook" />
      </div>
    </div>
  );
}

interface SocialServiceVerificationProps {
  service: 'twitter' | 'facebook';
  request: BackstageRequest;
}
function SocialServiceVerification({
  service,
  request,
}: SocialServiceVerificationProps) {
  const account = request.user.social_profiles.find(
    s => s.service_name === service,
  );
  if (!account) return null;

  return (
    <VerificationListItem
      icon={
        service === 'twitter' ? (
          <TwitterIcon className="text-twitter" />
        ) : (
          <FacebookIcon className="text-facebook" />
        )
      }
      title={
        <span className="capitalize">
          <Trans message=":service account" values={{service}} />
        </span>
      }
      action={
        <Button
          elementType="a"
          className={LinkStyle}
          variant="outline"
          color="primary"
          size="xs"
          href={
            service === 'twitter'
              ? `https://twitter.com/${account.username}`
              : `https://facebook.com/${account.username}`
          }
          target="_blank"
        >
          <Trans message="View" />
        </Button>
      }
      description={account.username}
    />
  );
}

interface AttachmentLayoutProps {
  icon: ReactElement<SvgIconProps>;
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
}
function VerificationListItem({
  icon,
  title,
  description,
  action,
}: AttachmentLayoutProps) {
  return (
    <div className="mb-8 flex items-center gap-8 rounded border px-14 py-8">
      <div className="flex-shrink-0 text-muted">
        {cloneElement(icon, {size: 'lg'})}
      </div>
      <div className="mr-auto overflow-hidden whitespace-nowrap">
        <div className="overflow-hidden overflow-ellipsis text-xs text-muted">
          {title}
        </div>
        <div className="overflow-hidden overflow-ellipsis text-sm">
          {description}
        </div>
      </div>
      {action}
    </div>
  );
}
