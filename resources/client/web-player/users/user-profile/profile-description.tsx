import {ProfileDetails} from '@app/web-player/users/user-profile/profile-details';
import {ProfileLinks} from '@app/web-player/users/user-profile/profile-links';
import {useLinkifiedString} from '@ui/utils/hooks/use-linkified-string';
import clsx from 'clsx';
import {ProfileLink} from '../user-profile';

interface Props {
  profile?: ProfileDetails;
  links?: ProfileLink[];
}
export function ProfileDescription({profile, links}: Props) {
  const description = useLinkifiedString(profile?.description) || '';
  if (!profile) return null;
  return (
    <div className="min-w-0 text-sm text-muted">
      {profile.description && (
        <div
          className={clsx('line-clamp-2 max-w-720')}
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      )}
      {profile.city || profile.country || links?.length ? (
        <div className="mt-12 flex items-center justify-between gap-24">
          {(profile.city || profile.country) && (
            <div className="md:w-max">
              {profile.city}
              {profile.city && ','} {profile.country}
            </div>
          )}
          <ProfileLinks links={links} />
        </div>
      ) : null}
    </div>
  );
}
