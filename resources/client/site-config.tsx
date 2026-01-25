import {getUserProfileLink} from '@app/web-player/users/user-profile-link';
import {SiteConfigContextValue} from '@common/core/settings/site-config-context';
import {CommonUploadType} from '@common/uploads/common-upload-type';
import {message} from '@ui/i18n/message';

export const SiteConfig: Partial<SiteConfigContextValue> = {
  auth: {
    getUserProfileLink: getUserProfileLink,
  },
  admin: {
    ads: [
      {
        image: 'images/verts/general_top.webp',
        slot: 'ads.general_top',
        description: message(
          'Appears at the top of most pages. Best size <= 150px height or responsive.',
        ),
      },
      {
        image: 'images/verts/general_bottom.webp',
        slot: 'ads.general_bottom',
        description: message(
          'Appears at the bottom of most pages. Best size <= 150px height or responsive.',
        ),
      },
      {
        image: 'images/verts/artist_top.webp',
        slot: 'ads.artist_top',
        description: message(
          'Appears in artist page only (below page header). Best size <= 1000px width or responsive.',
        ),
      },
      {
        image: 'images/verts/artist_bottom.webp',
        slot: 'ads.artist_bottom',
        description: message(
          'Appears in artist page only (below similar artists). Best size <= 430px width or responsive.',
        ),
      },
      {
        image: 'images/verts/album_top.webp',
        slot: 'ads.album_above',
        description: message(
          'Appears in album page only (above album tracks). Best size is as wide as possible or responsive.',
        ),
      },
    ],
  },
};

export const UploadType = {
  ...CommonUploadType,
  media: 'media',
  artwork: 'artwork',
  backstageAttachments: 'backstageAttachments',
} as const;
