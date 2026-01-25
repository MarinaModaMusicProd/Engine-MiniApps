interface MediaItem {
  id: number;
  model_type: string;
}

export function queueGroupId(
  model: MediaItem,
  kind: string = '*',
  sortDescriptor?: {orderBy?: string; orderDir?: string},
): string {
  let base = `${model.model_type}.${model.id}.${kind}`;
  if (sortDescriptor?.orderBy && sortDescriptor?.orderDir) {
    base += `.${sortDescriptor.orderBy.replace('.', '^')}|${
      sortDescriptor.orderDir
    }`;
  }
  return base;
}

export function splitQueueGroupId(queueGroupId: string): {
  modelType?: string;
  modelId?: number;
  kind?: string;
  sortDescriptor?: {orderBy?: string; orderDir?: string};
} {
  const [modelType, modelId, kind, sortDescriptorString] =
    queueGroupId.split('.');

  if (!modelType || !modelId || !kind) {
    return {};
  }

  let sortDescriptor: {orderBy?: string; orderDir?: string} | undefined;
  if (sortDescriptorString) {
    const [orderBy, orderDir] = sortDescriptorString.split('|');
    sortDescriptor = {
      orderBy,
      orderDir,
    };
  }

  return {
    modelType,
    modelId: +modelId,
    kind,
    sortDescriptor,
  };
}
