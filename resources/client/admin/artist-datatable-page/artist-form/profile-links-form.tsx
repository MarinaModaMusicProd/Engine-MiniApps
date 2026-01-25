import {ProfileLink} from '@app/web-player/users/user-profile';
import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {AddIcon} from '@ui/icons/material/Add';
import {CloseIcon} from '@ui/icons/material/Close';
import {useFieldArray} from 'react-hook-form';

export function ProfileLinksForm() {
  const {fields, append, remove} = useFieldArray<{links: ProfileLink[]}>({
    name: 'links',
  });
  return (
    <div>
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="mb-10 flex items-end gap-10">
            <FormTextField
              required
              type="url"
              label={<Trans message="URL" />}
              name={`links.${index}.url`}
              size="sm"
              className="flex-auto"
            />
            <FormTextField
              required
              label={<Trans message="Short title" />}
              name={`links.${index}.title`}
              size="sm"
              className="flex-auto"
            />
            <IconButton
              size="sm"
              color="primary"
              className="flex-shrink-0"
              onClick={() => {
                remove(index);
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        );
      })}
      <Button
        variant="text"
        color="primary"
        startIcon={<AddIcon />}
        size="xs"
        onClick={() => {
          append({url: '', title: ''});
        }}
      >
        <Trans message="Add another link" />
      </Button>
    </div>
  );
}
