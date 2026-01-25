export const UpdateStep = {
  Preparing: 'preparing',
  Downloading: 'downloading',
  Extracting: 'extracting',
  MovingNewFiles: 'moving_new_files',
  Finalizing: 'finalizing',
} as const;

export const UpdateStepMessage = {
  [UpdateStep.Preparing]: 'Preparing to update',
  [UpdateStep.Downloading]: 'Downloading update',
  [UpdateStep.Extracting]: 'Extracting update',
  [UpdateStep.MovingNewFiles]: 'Copying new files',
  [UpdateStep.Finalizing]: 'Finalizing update',
};

export type UpdateStepName = (typeof UpdateStep)[keyof typeof UpdateStep];

export const UpdateStepStatus = {
  Active: 'active',
  Completed: 'completed',
  Failed: 'failed',
} as const;

export type UpdateEvent = {
  type: 'event';
  step: UpdateStepName;
  status: (typeof UpdateStepStatus)[keyof typeof UpdateStepStatus];
  message: string;
  context?: {
    error?: string;
    progressPercentage?: number;
  };
};
