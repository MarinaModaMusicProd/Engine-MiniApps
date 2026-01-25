import {RemoteFavicon} from '@common/ui/other/remote-favicon';
import {IconButton} from '@ui/buttons/icon-button';
import {Tooltip} from '@ui/tooltip/tooltip';
import {ProfileLink} from '../user-profile';

interface ProfileLinksProps {
  links?: ProfileLink[];
}
export function ProfileLinks({links}: ProfileLinksProps) {
  if (!links?.length) return null;
  return (
    <div className="flex items-center">
      {links.map(link => (
        <Tooltip label={link.title} key={link.url}>
          <IconButton
            size="xs"
            elementType="a"
            href={link.url}
            target="_blank"
            rel="noreferrer"
          >
            <RemoteFavicon url={link.url} alt={link.title} />
          </IconButton>
        </Tooltip>
      ))}
    </div>
  );
}
