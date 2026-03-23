import clsx from 'clsx';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  margin?: string;
};
export function ArtistPageSubtitle({children, margin = 'my-16'}: Props) {
  return <h2 className={clsx('text-lg font-bold', margin)}>{children}</h2>;
}
