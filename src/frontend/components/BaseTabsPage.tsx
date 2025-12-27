import { ReactNode } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

type TabConfig = {
  key: string;      // eventKey used by Tabs
  title: ReactNode; // label shown on the tab
};

type BaseTabsPageProps = {
  activeKey: string;
  onSelect: (key: string | null) => void;
  tabs: TabConfig[];
};

function BaseTabsPage({ activeKey, onSelect, tabs }: BaseTabsPageProps) {
  return (
    <div className="container mt-4">
      <Tabs activeKey={activeKey} onSelect={onSelect} className="mb-3" fill>
        {tabs.map((tab) => (
          <Tab eventKey={tab.key} title={tab.title} key={tab.key} />
        ))}
      </Tabs>
    </div>
  );
}

export default BaseTabsPage;