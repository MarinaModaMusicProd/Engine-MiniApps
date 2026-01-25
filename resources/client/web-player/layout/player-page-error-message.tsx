import {useIsOffline} from '@app/web-player/use-is-offline';
import {PageErrorMessage} from '@common/errors/page-error-message';
import {queryClient} from '@common/http/query-client';
import {NotFoundPage} from '@common/ui/not-found-page/not-found-page';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {ErrorIcon} from '@ui/icons/material/Error';
import {IllustratedMessage} from '@ui/images/illustrated-message';
import {isAxiosError} from 'axios';
import {useState} from 'react';
import {Link, useRouteError} from 'react-router';

export function PlayerPageErrorMessage() {
  const isOffline = useIsOffline();
  const error = useRouteError();
  console.warn(error);

  if (isAxiosError(error) && error.response?.status === 404) {
    return <NotFoundPage />;
  }

  return isOffline ? <OfflineMessage /> : <PageErrorMessage />;
}

function OfflineMessage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetry = async () => {
    setIsRetrying(true);
    await queryClient.resetQueries();
    setIsRetrying(false);
  };
  return (
    <IllustratedMessage
      className="mt-40"
      image={
        <div>
          <ErrorIcon size="xl" />
        </div>
      }
      imageHeight="h-auto"
      title={<Trans message="Connect to the internet" />}
      description={<Trans message="You're offline. Check your connection." />}
      action={
        <div className="flex flex-col items-center gap-12">
          <Button
            elementType={Link}
            variant="flat"
            color="primary"
            to="/library/downloads"
          >
            <Trans message="Go to downloads" />
          </Button>
          <Button
            onClick={() => {
              handleRetry();
            }}
            disabled={isRetrying}
          >
            <Trans message="Retry" />
          </Button>
        </div>
      }
    />
  );
}
