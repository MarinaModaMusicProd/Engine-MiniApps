import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import {LucideIcon} from '@ui/icons/lucide/lucide-icon-wrapper';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {downloadFileFromUrl} from '@ui/utils/files/download-file-from-url';
import {DownloadIcon} from 'lucide-react';
import {Fragment, useState} from 'react';
import {ExportCsvPayload, useExportCsv} from '../requests/use-export-csv';
import {CsvExportInfoDialog} from './csv-export-info-dialog';

interface DataTableExportCsvButtonProps {
  endpoint: string;
  payload?: ExportCsvPayload;
}
export function DataTableExportCsvButton({
  endpoint,
  payload,
}: DataTableExportCsvButtonProps) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const exportCsv = useExportCsv(endpoint);

  return (
    <Fragment>
      <Button
        variant="outline"
        size="sm"
        className="flex-shrink-0"
        disabled={exportCsv.isPending}
        startIcon={<LucideIcon icon={DownloadIcon} size="xs" />}
        onClick={() => {
          exportCsv.mutate(payload, {
            onSuccess: response => {
              if (response.downloadPath) {
                downloadFileFromUrl(response.downloadPath);
              } else {
                setDialogIsOpen(true);
              }
            },
          });
        }}
      >
        <Trans message="Export" />
      </Button>
      <DialogTrigger
        type="modal"
        isOpen={dialogIsOpen}
        onOpenChange={setDialogIsOpen}
      >
        <CsvExportInfoDialog />
      </DialogTrigger>
    </Fragment>
  );
}
