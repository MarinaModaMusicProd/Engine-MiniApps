import {User} from '@ui/types/user';
import {slugifyString} from '@ui/utils/string/slugify-string';
import clsx from 'clsx';
import {useMemo} from 'react';
import {Link, LinkProps} from 'react-router';

interface UserProfileLinkProps extends Omit<LinkProps, 'to'> {
  user: User;
  className?: string;
}
export function UserProfileLink({
  user,
  className,
  ...linkProps
}: UserProfileLinkProps) {
  const finalUri = useMemo(() => {
    return getUserProfileLink(user);
  }, [user]);

  return (
    <Link
      {...linkProps}
      className={clsx('hover:underline', className)}
      to={finalUri}
    >
      {user.name}
    </Link>
  );
}

export function getUserProfileLink(user: {
  id: number | string;
  name: string;
}): string {
  return `/user/${user.id}/${slugifyString(user.name)}`;
}
