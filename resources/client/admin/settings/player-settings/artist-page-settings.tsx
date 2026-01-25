import {artistPageTabs} from '@app/web-player/artists/artist-page-tabs';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {IconButton} from '@ui/buttons/icon-button';
import {Item} from '@ui/forms/listbox/item';
import {FormSelect} from '@ui/forms/select/select';
import {Checkbox} from '@ui/forms/toggle/checkbox';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {DragHandleIcon} from '@ui/icons/material/DragHandle';
import {DragPreview} from '@ui/interactions/dnd/drag-preview';
import {useSortable} from '@ui/interactions/dnd/sortable/use-sortable';
import {DragPreviewRenderer} from '@ui/interactions/dnd/use-draggable';
import {moveItemInNewArray} from '@ui/utils/array/move-item-in-new-array';
import clsx from 'clsx';
import React, {Fragment, ReactElement, ReactNode, useRef} from 'react';
import {useForm, useFormContext} from 'react-hook-form';

type ArtistTab = {
  id: string;
  active: boolean;
};

interface Props {
  tabs: ReactElement;
  title: ReactElement<MessageDescriptor>;
}
export function ArtistPageSettings({tabs, title}: Props) {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        player: {
          default_artist_view:
            data.client.player?.default_artist_view ?? 'list',
        },
        artistPage: {
          tabs: data.client.artistPage?.tabs ?? [],
          showDescription: data.client.artistPage?.showDescription ?? false,
        },
      },
    },
  });
  return (
    <AdminSettingsLayout form={form} title={title} tabs={tabs}>
      <TabsPanel />
      <AlbumsLayoutPanel />
      <DescriptionPanel />
    </AdminSettingsLayout>
  );
}

function TabsPanel() {
  const {watch} = useFormContext<AdminSettings>();
  const tabs = (watch('client.artistPage.tabs') || []) as ArtistTab[];
  return (
    <SettingsPanel
      layout="vertical"
      className="mb-24"
      title={<Trans message="Artist page tabs" />}
      description={
        <Trans message="Select which tabs should appear on artist page and in which order." />
      }
    >
      {tabs.map(tab => (
        <Fragment key={tab.id}>{getListItem(tab.id)}</Fragment>
      ))}
    </SettingsPanel>
  );
}

function AlbumsLayoutPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Default albums layout" />}
      description={
        <Trans message="How should albums on main artist page be displayed by default." />
      }
    >
      <FormSelect
        className="my-24"
        name="client.player.default_artist_view"
        selectionMode="single"
        label={<Trans message="Layout" />}
      >
        <Item value="list">
          <Trans message="List" />
        </Item>
        <Item value="grid">
          <Trans message="Grid" />
        </Item>
      </FormSelect>
    </SettingsPanel>
  );
}

function DescriptionPanel() {
  return (
    <SettingsPanel
      className="mb-24"
      title={<Trans message="Description" />}
      description={
        <Trans message="Whether short artist biography be shown in main artist page header." />
      }
    >
      <FormSwitch name="client.artistPage.showDescription">
        <Trans message="Show description" />
      </FormSwitch>
    </SettingsPanel>
  );
}

function getListItem(id: string) {
  switch (id) {
    case artistPageTabs.tracks:
      return (
        <ArtistTabListItem
          id={artistPageTabs.tracks}
          title={<Trans message="Tracks" />}
          description={
            <Trans message="Show all artist tracks in a list view." />
          }
        />
      );
    case artistPageTabs.albums:
      return (
        <ArtistTabListItem
          id={artistPageTabs.albums}
          title={<Trans message="Albums" />}
          description={
            <Trans message="Show all artist albums in a list view." />
          }
        />
      );
    case artistPageTabs.followers:
      return (
        <ArtistTabListItem
          id={artistPageTabs.followers}
          title={<Trans message="Followers" />}
          description={
            <Trans message="Shows all users that are currently following an artist." />
          }
        />
      );
    case artistPageTabs.similar:
      return (
        <ArtistTabListItem
          id={artistPageTabs.similar}
          title={<Trans message="Similar artists" />}
          description={<Trans message="Shows similar artists." />}
        />
      );
    case artistPageTabs.about:
      return (
        <ArtistTabListItem
          id={artistPageTabs.about}
          title={<Trans message="About" />}
          description={
            <Trans message="Shows artist biography/description as well as extra images" />
          }
        />
      );
    case artistPageTabs.discography:
      return (
        <ArtistTabListItem
          id={artistPageTabs.discography}
          title={<Trans message="Discography" />}
          description={
            <Trans message="Shows all artist albums in grid or list view." />
          }
        />
      );
  }
}

interface ArtistTabListItemProps {
  id: string;
  title: ReactNode;
  description: ReactNode;
}
function ArtistTabListItem({title, description, id}: ArtistTabListItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<DragPreviewRenderer>(null);
  const {watch, setValue} = useFormContext<AdminSettings>();
  const tabs = (watch('client.artistPage.tabs') || []) as ArtistTab[];
  const ids = tabs.map(tab => tab.id);
  const isChecked = tabs.find(tab => tab.id === id)?.active;
  const isFirst = ids[0] === id;

  const {sortableProps, dragHandleRef} = useSortable({
    ref,
    item: id,
    items: ids,
    type: 'artistPageTabs',
    preview: previewRef,
    strategy: 'line',
    onSortEnd: (oldIndex, newIndex) => {
      setValue(
        'client.artistPage.tabs',
        moveItemInNewArray(tabs, oldIndex, newIndex),
        {shouldDirty: true},
      );
    },
  });

  return (
    <Fragment>
      <div
        className={clsx(
          'flex w-full items-center gap-8 border-b py-6',
          isFirst && 'border-t border-t-transparent',
        )}
        ref={ref}
        {...sortableProps}
      >
        <IconButton ref={dragHandleRef}>
          <DragHandleIcon />
        </IconButton>
        <div className="flex-auto">
          <div className="text-sm">{title}</div>
          <div className="text-xs">{description}</div>
        </div>
        <Checkbox
          checked={isChecked}
          onChange={() => {
            const newTabs = tabs.map(tab => {
              if (tab.id === id) {
                return {...tab, active: !tab.active};
              }
              return tab;
            });
            setValue('client.artistPage.tabs', newTabs, {shouldDirty: true});
          }}
        />
      </div>
      <TabDragPreview title={title} ref={previewRef} />
    </Fragment>
  );
}

interface DragPreviewProps {
  title: ReactNode;
}
const TabDragPreview = React.forwardRef<DragPreviewRenderer, DragPreviewProps>(
  ({title}, ref) => {
    return (
      <DragPreview ref={ref}>
        {() => (
          <div className="rounded bg-chip p-8 text-sm shadow">{title}</div>
        )}
      </DragPreview>
    );
  },
);
