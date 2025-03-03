import {useContext, useEffect, useRef} from "react";
import {useIsConnectionRestored, useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
import {tonGeneratePayload, tonCheckProof} from "@common/auth/requests/use-web3-login";

const localStorageKey = 'my-dapp-auth-token';
const payloadTTLMS = 1000 * 60 * 20;

export function useTonConnectBackend() {
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
      localStorage.removeItem(localStorageKey);

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

    // const token = localStorage.getItem(localStorageKey);
    // if (token) {
    //   // setToken(token);
    //   return;
    // }

    tonConnectUI.onStatusChange(wallet => {
      console.log(wallet);
      if (wallet?.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)) {
        console.log(wallet?.connectItems.tonProof.proof, wallet.account);
        tonCheckProof(wallet.connectItems.tonProof.proof, wallet.account).then(result => {
          // if (result) {
          //   localStorage.setItem(localStorageKey, result);
          // } else {
          //   alert('Please try another wallet');
          //   tonConnectUI.disconnect();
          // }
        })
      }
      // else {
      //   alert('Please try another wallet');
      //   tonConnectUI.disconnect();
      // }
    })

  }, [wallet, isConnectionRestored])
}
