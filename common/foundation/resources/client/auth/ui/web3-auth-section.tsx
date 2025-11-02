import {Fragment, ReactNode} from 'react';
import clsx from 'clsx';
import {useAllWeb3LoginsDisabled} from '@common/auth/ui/use-all-web3-logins-disabled';
import {useSettings} from '@ui/settings/use-settings';
import TonLoginButton from "@common/auth/ui/web3-button/TonLoginButton";

interface Web3AuthSectionProps {
  dividerMessage: ReactNode;
}

export function Web3AuthSection({dividerMessage}: Web3AuthSectionProps) {
  const {web3} = useSettings();

  if (useAllWeb3LoginsDisabled()) {
    return null;
  }

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
        {web3?.ton?.enable && <Web3LoginButton type='ton'/>}
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
    return (
      <TonLoginButton className="w-100"/>
    );
  }
}
