import {ProfileLinksForm} from '@app/admin/artist-datatable-page/artist-form/profile-links-form';
import {UploadType} from '@app/site-config';
import {FullUserProfile} from '@app/web-player/users/user-profile';
import {
  UpdateProfilePayload,
  useUpdateUserProfile,
} from '@app/web-player/users/user-profile/use-update-user-profile';
import {useValueLists} from '@common/http/value-lists';
import {FormImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Button} from '@ui/buttons/button';
import {Option} from '@ui/forms/combobox/combobox';
import {FormComboBox} from '@ui/forms/combobox/form-combobox';
import {Form} from '@ui/forms/form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {useForm} from 'react-hook-form';

interface Props {
  user: FullUserProfile;
}
export function EditProfileDialog({user}: Props) {
  const {close, formId} = useDialogContext();
  const {data} = useValueLists(['countries']);
  const form = useForm<UpdateProfilePayload>({
    defaultValues: {
      user: {
        username: user.username ?? '',
        image: user.image,
      },
      profile: {
        city: user.profile.city ?? '',
        country: user.profile.country ?? '',
        description: user.profile.description ?? '',
      },
      links: user.links,
    },
  });
  const updateProfile = useUpdateUserProfile(form);
  return (
    <Dialog size="xl">
      <DialogHeader>
        <Trans message="Edit your profile" />
      </DialogHeader>
      <DialogBody>
        <Form
          id={formId}
          form={form}
          onSubmit={values =>
            updateProfile.mutate(values, {onSuccess: () => close()})
          }
        >
          <FileUploadProvider>
            <div className="items-start gap-30 md:flex">
              <FormImageSelector
                label={<Trans message="Avatar" />}
                name="user.image"
                uploadType={UploadType.avatars}
                variant="square"
                previewSize="w-200 h-200"
                className="max-md:mb-20"
                onChange={(_, entry) => {
                  form.setValue('user.image', entry?.url ?? null);
                  form.setValue('user.image_entry_id', entry?.id ?? null);
                }}
              />
              <div className="flex-auto">
                <FormTextField
                  name="user.username"
                  label={<Trans message="Username" />}
                  className="mb-24"
                />
                <div className="flex items-center gap-24">
                  <FormTextField
                    name="profile.city"
                    label={<Trans message="City" />}
                    className="mb-24 flex-1"
                  />
                  <FormComboBox
                    className="mb-24 flex-1"
                    selectionMode="single"
                    name="profile.country"
                    label={<Trans message="Country" />}
                  >
                    {data?.countries?.map(country => (
                      <Option key={country.code} value={country.name}>
                        {country.name}
                      </Option>
                    ))}
                  </FormComboBox>
                </div>
                <FormTextField
                  name="profile.description"
                  label={<Trans message="Description" />}
                  inputElementType="textarea"
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-24">
              <div className="mb-16 border-b pb-16">
                <Trans message="Your links" />
              </div>
              <ProfileLinksForm />
            </div>
          </FileUploadProvider>
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          onClick={() => {
            close();
          }}
        >
          <Trans message="Cancel" />
        </Button>
        <Button
          form={formId}
          type="submit"
          variant="flat"
          color="primary"
          disabled={updateProfile.isPending}
        >
          <Trans message="Save" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
