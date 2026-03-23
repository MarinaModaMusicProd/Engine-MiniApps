import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';

type Props = {
  inline?: boolean;
};
export function ExternalIdsFields({inline}: Props) {
  return (
    <div className={clsx(inline && 'flex flex-wrap gap-12')}>
      <FormTextField
        name="spotify_id"
        label={<Trans message="Spotify ID" />}
        className={clsx(inline ? 'flex-1' : 'mb-24')}
        minLength={22}
        maxLength={22}
      />
      <FormTextField
        name="deezer_id"
        label={<Trans message="Deezer ID" />}
        type="number"
        className={clsx(inline ? 'flex-1' : 'mb-24')}
      />
    </div>
  );
}
