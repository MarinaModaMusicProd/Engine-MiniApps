import {channelQueries} from '@common/channels/channel-queries';
import {useQuery} from '@tanstack/react-query';
import {LinkStyle} from '@ui/buttons/external-link';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Item} from '@ui/forms/listbox/item';
import {FormSelect} from '@ui/forms/select/select';
import {Trans} from '@ui/i18n/trans';
import {Link} from 'react-router';

type Props = {
  index: number;
};
export function ChannelSectionSettings({index}: Props) {
  const prefix =
    `client.landingPage.sections.${index}` as `client.landingPage.sections.${number}`;
  const query = useQuery(channelQueries.index());
  const channels = query.data?.pagination?.data ?? [];

  return (
    <>
      <FormTextField
        label={<Trans message="Badge" />}
        className="mb-20"
        name={`${prefix}.badge`}
      />
      <FormTextField
        label={<Trans message="Title" />}
        className="mb-20"
        name={`${prefix}.title`}
      />
      <FormTextField
        label={<Trans message="Description" />}
        className="mb-20"
        inputElementType="textarea"
        rows={4}
        name={`${prefix}.description`}
      />
      <FormSelect
        label={<Trans message="Channel" />}
        className="mb-20"
        name={`${prefix}.channelId`}
        selectionMode="single"
      >
        {channels.map(channel => (
          <Item key={channel.id} value={`${channel.id}`}>
            {channel.name}
          </Item>
        ))}
      </FormSelect>
      <div className="text-sm">
        <Trans
          message="Configure channel content from <a>Channel manager</a>."
          values={{
            a: text => (
              <Link className={LinkStyle} to="/admin/channels" target="_blank">
                {text}
              </Link>
            ),
          }}
        />
      </div>
    </>
  );
}
