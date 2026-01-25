import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {UserImage} from '@app/web-player/users/user-image';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {getUserProfileLink} from '@app/web-player/users/user-profile-link';
import {Trans} from '@ui/i18n/trans';
import {Link} from 'react-router';

interface UserGridItemProps {
  user: PartialUserProfile;
  layout?: ContentGridItemLayout;
}
export function UserGridItem({user, layout}: UserGridItemProps) {
  return (
    <div>
      <Link to={getUserProfileLink(user)}>
        <UserImage
          user={user}
          className="aspect-square w-full rounded-full shadow-md"
        />
      </Link>
      <div className="mt-12 text-center text-sm">
        <div className="overflow-hidden overflow-ellipsis">
          <Link to={getUserProfileLink(user)}>{user.name}</Link>
        </div>
        {user.followers_count ? (
          <div className="mt-4 overflow-hidden overflow-ellipsis whitespace-nowrap text-muted">
            <Trans
              message=":count followers"
              values={{count: user.followers_count}}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
