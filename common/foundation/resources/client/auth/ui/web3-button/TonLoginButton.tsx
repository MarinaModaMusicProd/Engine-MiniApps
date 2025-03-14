import {useNavigate} from "@common/ui/navigation/use-navigate";
import {useAuth} from "@common/auth/use-auth";
import {
  useIsConnectionRestored,
  useTonConnectUI,
  useTonWallet
} from "@tonconnect/ui-react";
import {useEffect, useRef} from "react";
import {
  tonCheckProof,
  tonGeneratePayload
} from "@common/auth/requests/use-web3-login";
import {TonConnectButton} from "@tonconnect/ui-react";
import {setBootstrapData} from "@ui/bootstrap-data/bootstrap-data-store";

const TonLoginButton = ({className}: {className: string}) => {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  const payloadTTLMS = 1000 * 60 * 20;
  const isConnectionRestored = useIsConnectionRestored();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const interval = useRef<ReturnType<typeof setInterval> | undefined>();

  useEffect(() => {
    if (!isConnectionRestored) {
      return;
    }

    clearInterval(interval.current);

    if (!wallet) {
      const refreshPayload = async () => {
        tonConnectUI.setConnectRequestParameters({ state: 'loading' });

        const value: {tonProof: string} | any = await tonGeneratePayload();

        if (!value?.tonProof) {
          tonConnectUI.setConnectRequestParameters(null);
        } else {
          tonConnectUI.setConnectRequestParameters({state: 'ready', value});
        }
      }

      refreshPayload();

      setInterval(refreshPayload, payloadTTLMS);

      return;
    }

    if (wallet?.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)) {
      tonCheckProof(wallet.connectItems.tonProof.proof, wallet.account).then(response => {
        if (response) {
          setBootstrapData(response.bootstrapData);
          navigate(getRedirectUri(), {replace: true})
        } else {
          tonConnectUI.disconnect();
        }
      })
    }
  }, [wallet, isConnectionRestored])

  return <TonConnectButton className={className}/>
}

export default TonLoginButton
