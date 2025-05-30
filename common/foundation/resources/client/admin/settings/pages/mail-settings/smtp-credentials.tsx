import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {FormSelect} from '@ui/forms/select/select';
import {Item} from '@ui/forms/listbox/item';

export interface SmtpCredentialsProps {
  isInvalid: boolean;
}
export function SmtpCredentials({isInvalid}: SmtpCredentialsProps) {
  return (
    <>
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.mail_host"
        label={<Trans message="SMTP host" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.mail_username"
        label={<Trans message="SMTP username" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        type="password"
        name="server.mail_password"
        label={<Trans message="SMTP password" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        type="number"
        name="server.mail_port"
        label={<Trans message="SMTP port" />}
      />
      <FormSelect
        selectionMode="single"
        invalid={isInvalid}
        className="mb-30"
        name="server.mail_encryption"
        label={<Trans message="SMTP encryption" />}
      >
        <Item value="">
          <Trans message="None" />
        </Item>
        <Item value="tls">
          <Trans message="TLS" />
        </Item>
        <Item value="ssl">
          <Trans message="SSL" />
        </Item>
      </FormSelect>
    </>
  );
}
