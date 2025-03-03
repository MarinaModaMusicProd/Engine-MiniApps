import {Fragment, ReactElement, ReactNode, useEffect} from 'react';
import {Button} from '@ui/buttons/button';
import {IconButton} from '@ui/buttons/icon-button';
import clsx from 'clsx';
import {useAllWeb3LoginsDisabled} from '@common/auth/ui/use-all-web3-logins-disabled';
import {useSettings} from '@ui/settings/use-settings';
import {message} from '@ui/i18n/message';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useAuth} from '@common/auth/use-auth';
import {useTonGeneratePayload} from '@common/auth/requests/use-web3-login';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet
} from "@tonconnect/ui-react";
import { Buffer } from 'buffer';
import {apiClient} from "@common/http/query-client";
import {useTonConnectBackend} from "@common/auth/hooks/use-ton-connect-backend";

interface Web3AuthSectionProps {
  dividerMessage: ReactNode;
}

export function Web3AuthSection({dividerMessage}: Web3AuthSectionProps) {
  const {web3} = useSettings();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  // const {loginWithWeb3} = useWeb3Login();

  if (useAllWeb3LoginsDisabled()) {
    return null;
  }

  // const handleWeb3Login = async (service: Web3Service) => {
  //   const e = await loginWithWeb3(service);
  //   if (e?.status === 'SUCCESS' || e?.status === 'ALREADY_LOGGED_IN') {
  //     navigate(getRedirectUri(), {replace: true});
  //   }
  // };

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
          !web3?.compact_buttons && 'flex-col',
        )}
      >
        {web3?.ton?.enable ? (
          <Web3LoginButton type='ton'/>
        ) : null}
      </div>
    </Fragment>
  );
}

interface Web3LoginButtonProps {
  type: string;
}

function Web3LoginButton({type}: Web3LoginButtonProps) {
  const settings = useSettings();

  if (type === 'ton' && settings.web3?.ton?.enable) {
    useTonConnectBackend();

    return (
      <TonConnectButton className="w-100"/>
    );
  }
}

function randomBytes(length: number) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}
