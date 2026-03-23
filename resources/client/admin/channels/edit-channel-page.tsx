import {AppChannelAutoUpdateField} from '@app/admin/channels/app-channel-auto-update-field';
import {AppChannelRestrictionField} from '@app/admin/channels/app-channel-restriction-field';
import {channelContentConfig} from '@app/admin/channels/channel-content-config';
import {ChannelContentItemImage} from '@app/admin/channels/channel-content-item-image';
import {ChannelContentEditor} from '@common/admin/channels/channel-editor/channel-content-editor';
import {
  ChannelContentSearchField,
  ChannelContentSearchFieldProps,
} from '@common/admin/channels/channel-editor/channel-content-search-field';
import {ChannelNameField} from '@common/admin/channels/channel-editor/controls/channel-name-field';
import {ChannelPaginationTypeField} from '@common/admin/channels/channel-editor/controls/channel-pagination-type-field';
import {ChannelSeoFields} from '@common/admin/channels/channel-editor/controls/channel-seo-fields';
import {ContentLayoutFields} from '@common/admin/channels/channel-editor/controls/content-layout-fields';
import {ContentModelField} from '@common/admin/channels/channel-editor/controls/content-model-field';
import {ContentOrderField} from '@common/admin/channels/channel-editor/controls/content-order-field';
import {ContentTypeField} from '@common/admin/channels/channel-editor/controls/content-type-field';
import {EditChannelPageLayout} from '@common/admin/channels/channel-editor/edit-channel-page-layout';
import {Accordion, AccordionItem} from '@ui/accordion/accordion';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {InfoDialogTrigger} from '@ui/overlays/dialog/info-dialog-trigger/info-dialog-trigger';
import {
  GlobeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  TextAlignEndIcon,
} from 'lucide-react';
import {Fragment} from 'react';

export function Component() {
  return (
    <EditChannelPageLayout>
      <Fragment>
        <Accordion variant="outline">
          <AccordionItem
            label={<Trans message="Title & description" />}
            startIcon={<LucideIcon icon={TextAlignEndIcon} size="xs" />}
          >
            <ChannelNameField />
            <FormSwitch
              className="mt-24"
              name="config.hideTitle"
              description={
                <Trans message="Whether title should be shown when displaying this channel on the site." />
              }
            >
              <Trans message="Hide title" />
            </FormSwitch>
            <FormTextField
              name="description"
              label={<Trans message="Description" />}
              inputElementType="textarea"
              rows={1}
              className="mt-24"
            />
            <FormTextField
              name="config.adminDescription"
              label={
                <Fragment>
                  <Trans message="Internal description" />
                  <InfoDialogTrigger
                    body={
                      <Trans message="This describes the purpose of the channel and is only visible in admin area." />
                    }
                  />
                </Fragment>
              }
              inputElementType="textarea"
              rows={1}
              className="mt-24"
            />
          </AccordionItem>
          <AccordionItem
            label={<Trans message="Content settings" />}
            startIcon={<LucideIcon icon={SettingsIcon} size="xs" />}
          >
            <ContentTypeField config={channelContentConfig} className="mb-24" />
            <AppChannelAutoUpdateField
              config={channelContentConfig}
              className="mb-24"
            />
            <ContentModelField
              config={channelContentConfig}
              className="mb-24"
            />
            <AppChannelRestrictionField
              config={channelContentConfig}
              className="mb-24"
            />
            <ContentOrderField
              config={channelContentConfig}
              className="mb-24"
            />
          </AccordionItem>
          <AccordionItem
            label={<Trans message="Layout" />}
            startIcon={<LucideIcon icon={LayoutDashboardIcon} size="xs" />}
          >
            <ContentLayoutFields
              config={channelContentConfig}
              className="mb-24"
            />
            <ChannelPaginationTypeField config={channelContentConfig} />
          </AccordionItem>
          <AccordionItem
            label={<Trans message="SEO" />}
            startIcon={<LucideIcon icon={GlobeIcon} size="xs" />}
          >
            <ChannelSeoFields />
          </AccordionItem>
        </Accordion>
        <ChannelContentEditor searchField={<SearchField />} />
      </Fragment>
    </EditChannelPageLayout>
  );
}

function SearchField(props: ChannelContentSearchFieldProps) {
  return (
    <ChannelContentSearchField
      {...props}
      imgRenderer={item => <ChannelContentItemImage item={item} />}
    />
  );
}
