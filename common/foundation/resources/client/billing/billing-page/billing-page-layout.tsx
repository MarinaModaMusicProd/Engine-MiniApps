import {Trans} from '@ui/i18n/trans';
import {Fragment} from 'react';
import {Outlet} from 'react-router';
import {StaticPageTitle} from '../../seo/static-page-title';
import {Footer} from '../../ui/footer/footer';
import {Navbar} from '../../ui/navigation/navbar/navbar';

export function Component() {
  return (
    <Fragment>
      <StaticPageTitle>
        <Trans message="Billing" />
      </StaticPageTitle>
      <Navbar color="bg" menuPosition="billing-page" />
      <div className="flex flex-col">
        <div className="container mx-auto my-24 flex-auto px-24">
          <Outlet />
        </div>
        <Footer className="container mx-auto px-24" />
      </div>
    </Fragment>
  );
}
