import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '../../http/backend-response/backend-response';
import {onFormQueryError} from '../../errors/on-form-query-error';
import {useNavigate} from '../../ui/navigation/use-navigate';
import {apiClient} from '../../http/query-client';
import {useAuth} from '../use-auth';
import {useCallback} from 'react';
import {setBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Account, TonProofItemReplySuccess} from "@tonconnect/sdk";

interface LoginResponse extends BackendResponse {
  bootstrapData: string;
  two_factor: false;
}
interface TwoFactorResponse {
  two_factor: true;
}

type Response = LoginResponse | TwoFactorResponse;

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
  token_name: string;
}

export function useTonGeneratePayload() {
  return useMutation({
    mutationFn: tonGeneratePayload,
    onSuccess: response => {
      console.log(response);
      return response
    },
    onError: error => {
      console.error(error)
    },
  });
}

export function useHandleLoginSuccess() {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();

  return useCallback(
    (response: LoginResponse) => {
      setBootstrapData(response.bootstrapData);
      navigate(getRedirectUri(), {replace: true});
    },

    [navigate, getRedirectUri],
  );
}

export function tonGeneratePayload(): Promise<Response> {
  return apiClient.get('auth/web3/ton/generate-payload', ).then(response => response.data);
}

export function tonCheckProof(proof: TonProofItemReplySuccess['proof'], account: Account): Promise<Response> {
  return apiClient.post('auth/web3/ton/check-ton-proof', {proof, account}).then(response => response.data);
}
