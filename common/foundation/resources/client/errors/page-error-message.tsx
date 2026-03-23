import {queryClient} from '@common/http/query-client';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {ErrorIcon} from '@ui/icons/material/Error';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {useState} from 'react';

export function PageErrorMessage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetry = async () => {
    setIsRetrying(true);
    await queryClient.removeQueries();
    setIsRetrying(false);
  };
  return (
    <IllustratedMessage
      className="pt-40"
      image={
        <div>
          <ErrorIcon size="xl" />
        </div>
      }
      imageHeight="h-auto"
      title={<Trans message="There was an issue loading this page" />}
      description={<Trans message="Please try again later" />}
      action={
        <Button
          variant="outline"
          onClick={() => {
            handleRetry();
          }}
          disabled={isRetrying}
        >
          <Trans message="Retry" />
        </Button>
      }
    />
  );
}
