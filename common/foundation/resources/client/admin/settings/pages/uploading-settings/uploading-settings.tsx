import {
  AdminSettingsForm,
  AdminSettingsLayout,
} from '@common/admin/settings/form/admin-settings-form';
import {useTrans} from '@ui/i18n/use-trans';
import {Trans} from '@ui/i18n/trans';
import {SettingsErrorGroup} from '@common/admin/settings/form/settings-error-group';
import {FormRadioGroup} from '@ui/forms/radio-group/radio-group';
import {FormRadio} from '@ui/forms/radio-group/radio';
import {FormFileSizeField} from '@common/uploads/components/file-size-field';
import {SettingsSeparator} from '@common/admin/settings/form/settings-separator';
import {JsonChipField} from '@common/admin/settings/form/json-chip-field';
import {message} from '@ui/i18n/message';
import {useMaxServerUploadSize} from '@common/admin/settings/pages/uploading-settings/max-server-upload-size';
import {SectionHelper} from '@common/ui/other/section-helper';
import {useForm, useFormContext} from 'react-hook-form';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {FormSelect} from '@ui/forms/select/select';
import {DropboxForm} from '@common/admin/settings/pages/uploading-settings/dropbox-form/dropbox-form';
import React, {Fragment} from 'react';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {useUploadS3Cors} from '@common/admin/settings/pages/uploading-settings/use-upload-s3-cors';
import {useAdminSettings} from '@common/admin/settings/requests/use-admin-settings';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {Button} from '@ui/buttons/button';
import {Item} from '@ui/forms/listbox/item';

export function UploadingSettings() {
  return (
    <AdminSettingsLayout
      title={<Trans message="Uploading" />}
      description={
        <Trans message="Configure size and type of files that users are able to upload. This will affect all uploads across the site." />
      }
    >
      {data => <Form data={data} />}
    </AdminSettingsLayout>
  );
}

interface FormProps {
  data: AdminSettings;
}
function Form({data}: FormProps) {
  const {trans} = useTrans();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        uploads: {
          max_size: data.client.uploads.max_size ?? 0,
          chunk_size: data.client.uploads.chunk_size ?? 0,
          available_space: data.client.uploads.available_space ?? 0,
          allowed_extensions: data.client.uploads.allowed_extensions ?? [],
          blocked_extensions: data.client.uploads.blocked_extensions ?? [],
          s3_direct_upload: data.client.uploads.s3_direct_upload ?? false,
        },
      },
      server: {
        static_file_delivery: data.server.static_file_delivery ?? '',
        uploads_disk_driver: data.server.uploads_disk_driver ?? 'local',
        public_disk_driver: data.server.public_disk_driver ?? 'local',

        // s3
        storage_s3_key: data.server.storage_s3_key ?? '',
        storage_s3_secret: data.server.storage_s3_secret ?? '',
        storage_s3_region: data.server.storage_s3_region ?? '',
        storage_s3_bucket: data.server.storage_s3_bucket ?? '',
        storage_s3_endpoint: data.server.storage_s3_endpoint ?? '',

        // digitalocean spaces
        storage_digitalocean_key: data.server.storage_digitalocean_key ?? '',
        storage_digitalocean_secret:
          data.server.storage_digitalocean_secret ?? '',
        storage_digitalocean_region:
          data.server.storage_digitalocean_region ?? '',
        storage_digitalocean_bucket:
          data.server.storage_digitalocean_bucket ?? '',

        // backblaze
        storage_backblaze_key: data.server.storage_backblaze_key ?? '',
        storage_backblaze_secret: data.server.storage_backblaze_secret ?? '',
        storage_backblaze_region: data.server.storage_backblaze_region ?? '',
        storage_backblaze_bucket: data.server.storage_backblaze_bucket ?? '',

        // ftp
        storage_ftp_host: data.server.storage_ftp_host ?? '',
        storage_ftp_username: data.server.storage_ftp_username ?? '',
        storage_ftp_password: data.server.storage_ftp_password ?? '',
        storage_ftp_root: data.server.storage_ftp_root ?? '',
        storage_ftp_port: data.server.storage_ftp_port ?? '21',
        storage_ftp_passive: data.server.storage_ftp_passive ?? false,
        storage_ftp_ssl: data.server.storage_ftp_ssl ?? false,

        // dropbox
        storage_dropbox_app_key: data.server.storage_dropbox_app_key ?? '',
        storage_dropbox_app_secret:
          data.server.storage_dropbox_app_secret ?? '',
        storage_dropbox_refresh_token:
          data.server.storage_dropbox_refresh_token ?? '',
      },
    },
  });

  return (
    <AdminSettingsForm form={form}>
      <PrivateUploadSection />
      <PublicUploadSection />
      <CredentialsSection />
      <SettingsErrorGroup name="static_delivery_group">
        {isInvalid => (
          <FormRadioGroup
            invalid={isInvalid}
            size="sm"
            name="server.static_file_delivery"
            orientation="vertical"
            label={<Trans message="File delivery optimization" />}
            description={
              <Trans message="Both X-Sendfile and X-Accel need to be enabled on the server first. When enabled, it will reduce server memory and CPU usage when previewing or downloading files, especially for large files." />
            }
          >
            <FormRadio value="">
              <Trans message="None" />
            </FormRadio>
            <FormRadio value="xsendfile">
              <Trans message="X-Sendfile (Apache)" />
            </FormRadio>
            <FormRadio value="xaccel">
              <Trans message="X-Accel (Nginx)" />
            </FormRadio>
          </FormRadioGroup>
        )}
      </SettingsErrorGroup>
      <FormFileSizeField
        className="mb-30"
        name="client.uploads.chunk_size"
        min={1}
        label={<Trans message="Chunk size" />}
        placeholder="Infinity"
        description={
          <Trans message="Size (in bytes) for each file chunk. It should only be changed if there is a maximum upload size on your server or proxy (for example cloudflare). If chunk size is larger then limit on the server, uploads will fail." />
        }
      />
      <MaxUploadSizeSection />
      <SettingsSeparator />
      <FormFileSizeField
        min={1}
        name="client.uploads.max_size"
        className="mb-30"
        label={<Trans message="Maximum file size" />}
        description={
          <Trans message="Maximum size (in bytes) for a single file user can upload." />
        }
      />
      <FormFileSizeField
        min={1}
        name="client.uploads.available_space"
        className="mb-30"
        label={<Trans message="Available space" />}
        description={
          <Trans message="Disk space (in bytes) each user uploads are allowed to take up. This can be overridden per user." />
        }
      />
      <JsonChipField
        name="client.uploads.allowed_extensions"
        className="mb-30"
        label={<Trans message="Allowed extensions" />}
        placeholder={trans(message('Add extension...'))}
        description={
          <Trans message="List of allowed file types (jpg, mp3, pdf etc.). Leave empty to allow all file types." />
        }
      />
      <JsonChipField
        name="client.uploads.blocked_extensions"
        label={<Trans message="Blocked extensions" />}
        placeholder={trans(message('Add extension...'))}
        description={
          <Trans message="Prevent uploading of these file types, even if they are allowed above." />
        }
      />
    </AdminSettingsForm>
  );
}

function MaxUploadSizeSection() {
  const {data} = useMaxServerUploadSize();
  return (
    <SectionHelper
      color="warning"
      description={
        <Trans
          message="Maximum upload size on your server currently is set to <b>:size</b>"
          values={{size: data?.maxSize, b: chunks => <b>{chunks}</b>}}
        />
      }
    />
  );
}

function PrivateUploadSection() {
  const {watch, clearErrors} = useFormContext<AdminSettings>();
  const isEnabled = watch('server.uploads_disk_driver');

  if (!isEnabled) return null;

  return (
    <FormSelect
      className="mb-30"
      selectionMode="single"
      name="server.uploads_disk_driver"
      label={<Trans message="User Uploads Storage Method" />}
      description={
        <Trans message="Where should user private file uploads be stored." />
      }
      onSelectionChange={() => {
        clearErrors();
      }}
    >
      <Item value="local">
        <Trans message="Local Disk (Default)" />
      </Item>
      <Item value="ftp">FTP</Item>
      <Item value="digitalocean_s3">DigitalOcean Spaces</Item>
      <Item value="backblaze_s3">Backblaze</Item>
      <Item value="s3">Amazon S3 (Or compatible service)</Item>
      <Item value="dropbox">Dropbox</Item>
      <Item value="rackspace">Rackspace</Item>
    </FormSelect>
  );
}

function PublicUploadSection() {
  const {watch, clearErrors} = useFormContext<AdminSettings>();
  const isEnabled = watch('server.public_disk_driver');

  if (!isEnabled) return null;

  return (
    <FormSelect
      label={<Trans message="Public Uploads Storage Method" />}
      selectionMode="single"
      name="server.public_disk_driver"
      description={
        <Trans message="Where should user public uploads (like avatars) be stored." />
      }
      onSelectionChange={() => {
        clearErrors();
      }}
    >
      <Item value="local">
        <Trans message="Local Disk (Default)" />
      </Item>
      <Item value="s3">Amazon S3</Item>
      <Item value="ftp">FTP</Item>
      <Item value="digitalocean_s3">DigitalOcean Spaces</Item>
      <Item value="backblaze_s3">Backblaze</Item>
    </FormSelect>
  );
}

function CredentialsSection() {
  const {watch} = useFormContext<AdminSettings>();
  const drives = [
    watch('server.uploads_disk_driver'),
    watch('server.public_disk_driver'),
  ];

  if (drives[0] === 'local' && drives[1] === 'local') {
    return null;
  }

  return (
    <SettingsErrorGroup separatorBottom={false} name="storage_group">
      {isInvalid => {
        if (drives.includes('s3')) {
          return <S3Form isInvalid={isInvalid} />;
        }
        if (drives.includes('ftp')) {
          return <FtpForm isInvalid={isInvalid} />;
        }
        if (drives.includes('dropbox')) {
          return <DropboxForm isInvalid={isInvalid} />;
        }
        if (drives.includes('digitalocean_s3')) {
          return <DigitalOceanForm isInvalid={isInvalid} />;
        }
        if (drives.includes('backblaze_s3')) {
          return <BackblazeForm isInvalid={isInvalid} />;
        }
      }}
    </SettingsErrorGroup>
  );
}

export interface CredentialFormProps {
  isInvalid: boolean;
}
function S3Form({isInvalid}: CredentialFormProps) {
  return (
    <Fragment>
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_s3_key"
        label={<Trans message="Amazon S3 key" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_s3_secret"
        label={<Trans message="Amazon S3 secret" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_s3_region"
        label={<Trans message="Amazon S3 region" />}
        placeholder="us-east-1"
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_s3_bucket"
        label={<Trans message="Amazon S3 bucket" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        name="server.storage_s3_endpoint"
        label={<Trans message="Amazon S3 endpoint" />}
        description={
          <Trans message="Only change endpoint if you are using another S3 compatible storage service." />
        }
      />
      <S3DirectUploadField invalid={isInvalid} />
    </Fragment>
  );
}

function DigitalOceanForm({isInvalid}: CredentialFormProps) {
  return (
    <Fragment>
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_digitalocean_key"
        label={<Trans message="DigitalOcean key" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_digitalocean_secret"
        label={<Trans message="DigitalOcean secret" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_digitalocean_region"
        label={<Trans message="DigitalOcean region" />}
        pattern="[a-z0-9\-]+"
        placeholder="us-east-1"
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_digitalocean_bucket"
        label={<Trans message="DigitalOcean bucket" />}
        required
      />
      <S3DirectUploadField invalid={isInvalid} />
    </Fragment>
  );
}

function BackblazeForm({isInvalid}: CredentialFormProps) {
  return (
    <Fragment>
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_backblaze_key"
        label={<Trans message="Backblaze KeyID" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_backblaze_secret"
        label={<Trans message="Backblaze applicationKey" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_backblaze_region"
        label={<Trans message="Backblaze Region" />}
        pattern="[a-z0-9\-]+"
        placeholder="us-west-002"
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_backblaze_bucket"
        label={<Trans message="Backblaze bucket name" />}
        required
      />
      <S3DirectUploadField invalid={isInvalid} />
    </Fragment>
  );
}

interface S3DirectUploadFieldProps {
  invalid: boolean;
}
function S3DirectUploadField({invalid}: S3DirectUploadFieldProps) {
  const uploadCors = useUploadS3Cors();
  const {data: defaultSettings} = useAdminSettings();

  const s3DriverEnabled =
    defaultSettings?.server.uploads_disk_driver?.endsWith('s3') ||
    defaultSettings?.server.public_disk_driver?.endsWith('s3');

  return (
    <Fragment>
      <FormSwitch
        className="mt-30"
        invalid={invalid}
        name="client.uploads.s3_direct_upload"
        description={
          <div>
            <p>
              <Trans message="Upload files directly from the browser to s3 without going through the server. It will save on server bandwidth and should result in faster upload times. This should be enabled, unless storage provider does not support multipart uploads." />
            </p>
            <p className="mt-10">
              <Trans message="If s3 provider is not configured to allow uploads from browser, this can be done automatically via CORS button below, when valid credentials are saved." />
            </p>
          </div>
        }
      >
        <Trans message="Direct upload" />
      </FormSwitch>
      <Button
        variant="flat"
        color="primary"
        size="xs"
        className="mt-20"
        onClick={() => {
          uploadCors.mutate();
        }}
        disabled={!s3DriverEnabled || uploadCors.isPending}
      >
        <Trans message="Configure CORS" />
      </Button>
    </Fragment>
  );
}

function FtpForm({isInvalid}: CredentialFormProps) {
  return (
    <>
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_ftp_host"
        label={<Trans message="FTP hostname" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_ftp_username"
        label={<Trans message="FTP username" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_ftp_password"
        label={<Trans message="FTP password" />}
        type="password"
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_ftp_root"
        label={<Trans message="FTP directory" />}
        placeholder="/"
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.storage_ftp_port"
        label={<Trans message="FTP port" />}
        type="number"
        min={0}
        placeholder="21"
      />
      <FormSwitch
        invalid={isInvalid}
        name="server.storage_ftp_passive"
        className="mb-30"
      >
        <Trans message="Passive" />
      </FormSwitch>
      <FormSwitch invalid={isInvalid} name="server.storage_ftp_ssl">
        <Trans message="SSL" />
      </FormSwitch>
    </>
  );
}
