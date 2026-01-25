import {ArtistPageSettings} from '@app/admin/settings/player-settings/artist-page-settings';
import {FunctionalitySettings} from '@app/admin/settings/player-settings/functionality-settings';
import {InterfaceSettings} from '@app/admin/settings/player-settings/interface-settings';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {Tab} from '@ui/tabs/tab';
import {TabList} from '@ui/tabs/tab-list';
import {Tabs} from '@ui/tabs/tabs';
import {Fragment, ReactElement} from 'react';
import {useSearchParams} from 'react-router';

const allTabs = [
  {
    name: 'functionality',
    label: message('Functionality'),
  },
  {
    name: 'interface',
    label: message('Interface'),
  },
  {
    name: 'artistPage',
    label: message('Artist page'),
  },
] as const;

type TabName = (typeof allTabs)[number]['name'];

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabName = (searchParams.get('tab') ?? 'functionality') as TabName;
  const tabIndex = allTabs.findIndex(tab => tab.name === tabName) ?? 0;

  return (
    <Fragment>
      <TabContent
        tabName={tabName}
        tabs={
          <Tabs
            selectedTab={tabIndex}
            onTabChange={tabIndex => {
              const tab = allTabs[tabIndex];
              setSearchParams({tab: tab.name}, {replace: true});
            }}
          >
            <TabList className="mx-24">
              {allTabs.map(tab => (
                <Tab key={tab.name}>
                  <Trans {...tab.label} />
                </Tab>
              ))}
            </TabList>
          </Tabs>
        }
      />
    </Fragment>
  );
}

interface TabContentProps {
  tabName: TabName;
  tabs: ReactElement;
}
function TabContent({tabName, tabs}: TabContentProps) {
  const title = <Trans message="Web player" />;
  switch (tabName) {
    case 'functionality':
      return <FunctionalitySettings tabs={tabs} title={title} />;
    case 'interface':
      return <InterfaceSettings tabs={tabs} title={title} />;
    case 'artistPage':
      return <ArtistPageSettings tabs={tabs} title={title} />;
  }
}
