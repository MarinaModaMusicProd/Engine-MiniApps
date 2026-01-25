import {UploadType} from '@app/site-config';
import {FormImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {ImageIcon} from '@ui/icons/material/Image';
import {Fragment} from 'react';

export function CrupdatePlaylistFields() {
  const {trans} = useTrans();
  return (
    <Fragment>
      <div className="gap-28 md:flex">
        <FileUploadProvider>
          <FormImageSelector
            name="image"
            uploadType={UploadType.artwork}
            variant="square"
            previewSize="w-160 h-160"
            className="mb-24 md:mb-0"
            placeholderIcon={<ImageIcon />}
            showRemoveButton
            stretchPreview
          />
        </FileUploadProvider>
        <div className="mb-34 flex-auto">
          <FormTextField
            autoFocus
            name="name"
            label={<Trans message="Name" />}
            className="mb-24"
          />
          <FormSwitch
            name="collaborative"
            description={<Trans message="Invite other users to add tracks." />}
            className="mb-24"
          >
            <Trans message="Collaborative" />
          </FormSwitch>
          <FormSwitch
            name="public"
            description={<Trans message="Everyone can see public playlists." />}
          >
            <Trans message="Public" />
          </FormSwitch>
        </div>
      </div>
      <FormTextField
        name="description"
        label={<Trans message="Description" />}
        inputElementType="textarea"
        rows={4}
        placeholder={trans(message('Give your playlist a catchy description.'))}
      />
    </Fragment>
  );
}
