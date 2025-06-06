import {useForm} from 'react-hook-form';
import {Fragment, ReactElement, ReactNode} from 'react';
import {
  ConnectSocialPayload,
  useConnectSocialWithPassword,
} from '../requests/connect-social-with-password';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import clsx from 'clsx';
import {EnvatoIcon} from '@ui/icons/social/envato';
import {useAllSocialLoginsDisabled} from '@common/auth/ui/use-all-social-logins-disabled';
import {useSettings} from '@ui/settings/use-settings';
import {message} from '@ui/i18n/message';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useAuth} from '@common/auth/use-auth';
import {
  SocialService,
  useSocialLogin,
} from '@common/auth/requests/use-social-login';
import {GoogleIcon} from '@ui/icons/social/google';
import {FacebookIcon} from '@ui/icons/social/facebook';
import {TwitterIcon} from '@ui/icons/social/twitter';
import {Trans} from '@ui/i18n/trans';
import {Form} from '@ui/forms/form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {useTrans} from '@ui/i18n/use-trans';

const googleLabel = message('Continue with google');
const facebookLabel = message('Continue with facebook');
const twitterLabel = message('Continue with twitter');
const envatoLabel = message('Continue with envato');

interface SocialAuthSectionProps {
  dividerMessage: ReactNode;
}
export function SocialAuthSection({dividerMessage}: SocialAuthSectionProps) {
  const {social} = useSettings();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  const {loginWithSocial, requestingPassword, setIsRequestingPassword} =
    useSocialLogin();

  if (useAllSocialLoginsDisabled()) {
    return null;
  }

  const handleSocialLogin = async (service: SocialService) => {
    const e = await loginWithSocial(service);
    if (e?.status === 'SUCCESS' || e?.status === 'ALREADY_LOGGED_IN') {
      navigate(getRedirectUri(), {replace: true});
    }
  };

  return (
    <Fragment>
      <div className="relative my-20 text-center before:absolute before:left-0 before:top-1/2 before:h-1 before:w-full before:-translate-y-1/2 before:bg-divider">
        <span className="relative z-10 bg-paper px-10 text-sm text-muted">
          {dividerMessage}
        </span>
      </div>
      <div
        className={clsx(
          'flex items-center justify-center gap-14',
          !social?.compact_buttons && 'flex-col',
        )}
      >
        {social?.google?.enable ? (
          <SocialLoginButton
            label={googleLabel}
            icon={<GoogleIcon viewBox="0 0 48 48" />}
            onClick={() => handleSocialLogin('google')}
          />
        ) : null}
        {social?.facebook?.enable ? (
          <SocialLoginButton
            label={facebookLabel}
            icon={<FacebookIcon className="text-facebook" />}
            onClick={() => handleSocialLogin('facebook')}
          />
        ) : null}
        {social?.twitter?.enable ? (
          <SocialLoginButton
            label={twitterLabel}
            icon={<TwitterIcon className="text-twitter" />}
            onClick={() => handleSocialLogin('twitter')}
          />
        ) : null}
        {social?.envato?.enable ? (
          <SocialLoginButton
            label={envatoLabel}
            icon={<EnvatoIcon viewBox="0 0 50 50" className="text-envato" />}
            onClick={() => handleSocialLogin('envato')}
          />
        ) : null}
      </div>
      <DialogTrigger
        type="modal"
        isOpen={requestingPassword}
        onOpenChange={setIsRequestingPassword}
      >
        <RequestPasswordDialog />
      </DialogTrigger>
    </Fragment>
  );
}

function RequestPasswordDialog() {
  const form = useForm<ConnectSocialPayload>();
  const {formId} = useDialogContext();
  const connect = useConnectSocialWithPassword(form);
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Password required" />
      </DialogHeader>
      <DialogBody>
        <div className="mb-30 text-sm text-muted">
          <Trans message="An account with this email address already exists. If you want to connect the two accounts, enter existing account password." />
        </div>
        <Form
          form={form}
          id={formId}
          onSubmit={payload => {
            connect.mutate(payload);
          }}
        >
          <FormTextField
            autoFocus
            name="password"
            type="password"
            required
            label={<Trans message="Password" />}
          />
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button variant="text">
          <Trans message="Cancel" />
        </Button>
        <Button
          type="submit"
          form={formId}
          variant="flat"
          color="primary"
          disabled={connect.isPending}
        >
          <Trans message="Connect" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

interface SocialLoginButtonProps {
  onClick: () => void;
  label: MessageDescriptor;
  icon: ReactElement;
}
function SocialLoginButton({onClick, label, icon}: SocialLoginButtonProps) {
  const {trans} = useTrans();
  const settings = useSettings();

  if (settings.social?.compact_buttons) {
    return (
      <IconButton variant="outline" aria-label={trans(label)} onClick={onClick}>
        {icon}
      </IconButton>
    );
  }

  return (
    <Button
      variant="outline"
      startIcon={icon}
      onClick={onClick}
      className="min-h-42 w-full"
    >
      <span className="min-w-160 text-start">
        <Trans {...label} />
      </span>
    </Button>
  );
}
