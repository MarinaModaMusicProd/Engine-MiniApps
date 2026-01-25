import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {PersonIcon} from '@ui/icons/material/Person';
import {StarIcon} from '@ui/icons/material/Star';
import clsx from 'clsx';

interface Props {
  user: PartialUserProfile;
  className?: string;
  size?: string;
  showProBadge?: boolean;
}
export function UserImage({user, className, size, showProBadge}: Props) {
  const {trans} = useTrans();
  const showBadge = showProBadge && user.is_pro;

  const imgClassName = clsx(
    className,
    size,
    'object-cover bg-fg-base/4 h-full w-full',
    !user.image ? 'flex items-center justify-center' : 'block',
  );

  return (
    <div
      className={clsx(
        'relative isolate flex-shrink-0 overflow-hidden',
        size,
        className,
      )}
    >
      {user.image ? (
        <img
          className={imgClassName}
          draggable={false}
          src={user.image}
          alt={trans(message('Avatar for :name', {values: {name: user.name}}))}
        />
      ) : (
        <span className={clsx(imgClassName, 'overflow-hidden')}>
          <PersonIcon className="max-w-[60%] text-divider" size="text-9xl" />
        </span>
      )}
      {showBadge && (
        <div
          className="absolute bottom-12 left-0 right-0 mx-auto flex w-max max-w-full items-center gap-6 rounded-full bg-black/60 px-8 py-4 text-sm text-white"
          color="positive"
        >
          <div className="rounded-full bg-primary p-1">
            <StarIcon className="text-white" size="sm" />
          </div>
          <Trans message="PRO user" />
        </div>
      )}
    </div>
  );
}
