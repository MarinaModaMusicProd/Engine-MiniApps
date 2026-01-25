interface Mode {
  isInsideSettingsPreview: boolean;
  settingsEditorParams: Record<string, string>;
}

export function useSettingsPreviewMode(): Mode {
  return getSettingsPreviewMode();
}

export function getSettingsPreviewMode(): Mode {
  const origins = location.ancestorOrigins;

  // check if we're in the iframe of the same origin first,
  // to avoid cross-origin errors when accessing window.frameElement
  const isSameOrigin =
    origins && origins.length > 0 && origins[0] === location.origin;
  if (!isSameOrigin) {
    return {
      isInsideSettingsPreview: false,
      settingsEditorParams: {},
    };
  }

  const iframe = (window.frameElement as HTMLIFrameElement) || undefined;
  if (!iframe?.src) {
    return {
      isInsideSettingsPreview: false,
      settingsEditorParams: {},
    };
  }

  const search = new URL(iframe.src).searchParams;
  return {
    isInsideSettingsPreview: search.get('settingsPreview') === 'true',
    settingsEditorParams: Object.fromEntries(search),
  };
}
