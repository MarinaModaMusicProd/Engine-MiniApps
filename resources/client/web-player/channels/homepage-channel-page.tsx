import {Component as ChannelPage} from '@app/web-player/channels/channel-page';
import {useSettings} from '@ui/settings/use-settings';

export function Component() {
  const {homepage} = useSettings();
  let slugOrId: number | string = 'discover';
  if (homepage.type.startsWith('channel') && homepage.value) {
    slugOrId = homepage.value;
  }
  return <ChannelPage slugOrId={slugOrId} />;
}
