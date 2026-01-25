import {themeEl} from '@ui/root-el';
import {CssTheme} from '@ui/themes/css-theme';
import {setThemeValue} from '@ui/themes/utils/set-theme-value';
import {themeValueToHex} from '@ui/themes/utils/theme-value-to-hex';

export function applyThemeToDom(theme: CssTheme) {
  Object.entries(theme.values).forEach(([key, value]) => {
    setThemeValue(key, value);
  });
  if (theme.is_dark) {
    themeEl.classList.add('dark');
  } else {
    themeEl.classList.remove('dark');
  }
  themeEl.dataset.themeId = `${theme.id}`;

  const themeColorMetaEl = document.querySelector('meta[name="theme-color"]');
  if (themeColorMetaEl) {
    themeColorMetaEl.setAttribute(
      'content',
      themeValueToHex(
        theme.is_dark ? theme.values['--be-bg'] : theme.values['--be-bg-alt'],
      ),
    );
  }
}
