import './App.css';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import BaseTabsPage from './components/BaseTabsPage';

const TABS = [
    { key: '/', title: 'Dashboard', path: '/' },
    { key: '/expense', title: 'Expense', path: '/expense' },
    { key: '/recurring', title: 'Recurring', path: '/recurring' },
    { key: '/cards', title: 'Cards', path: '/cards' },
    { key: '/users', title: 'Users', path: '/users' },
];

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const base = import.meta.env.BASE_URL || '/';
    const pathname = location.pathname;
    console.log('App location:', location);
    console.log('App pathname:', pathname);
    console.log('App base:', base);

    // Strip the Vite base from the pathname so we get app-relative paths
    const rawPath = pathname.startsWith(base)
        ? pathname.slice(base.length - 1)
        : pathname;

    console.log('App rawPath:', rawPath);

    const activeKey = TABS.find((t) => t.path === rawPath)?.path || '/';

    return (
        <div className="App">
            <BaseTabsPage
                activeKey={activeKey}
                onSelect={(key) => {
                    if (!key) return;
                    navigate(key);
                }}
                tabs={TABS.map((t) => ({ key: t.path, title: t.title }))}
            />
            <Outlet />
        </div>
    );
}

export default App;