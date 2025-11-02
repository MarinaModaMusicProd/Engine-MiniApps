import {isSsr} from '@ui/utils/dom/is-ssr';

interface UseAppearanceEditorModeResult {
  isAppearanceEditorActive: boolean;
  appearanceEditorParams: Record<string, string>;
}

export function useAppearanceEditorMode(): UseAppearanceEditorModeResult {
  const iframe = (window.frameElement as HTMLIFrameElement) || undefined;

  if (!iframe?.src || isSsr()) {
    return {
      isAppearanceEditorActive: false,
      appearanceEditorParams: {},
    };
  }

  const search = new URL(iframe.src).searchParams;

  return {
    isAppearanceEditorActive:
      !isSsr() && search.get('appearanceEditor') === 'true',
    appearanceEditorParams: Object.fromEntries(search),
  };
}
