import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

type MenuItem = {
    label: string;
    path: string;
};

const MENU_ITEMS: MenuItem[] = [
    { label: 'Landing', path: '/' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Credit Cards', path: '/cards' },
    { label: 'Users', path: '/users' },
    { label: 'Investments', path: '/investments' },
    { label: 'Settings', path: '/settings' },
];

function FloatingMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleItemClick = (path: string) => {
        navigate(path);
        setOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
        setOpen(false);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 1050,
            }}
        >
            <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpen((v) => !v)}
            >
                Menu
            </button>

            {open && (
                <div
                    className="mt-2 shadow"
                    style={{
                        position: 'absolute',
                        right: 0,
                        minWidth: '160px',
                        backgroundColor: 'white',
                        borderRadius: '0.25rem',
                        border: '1px solid rgba(0,0,0,0.15)',
                    }}
                >
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            className="btn btn-link w-100 text-start px-3 py-2"
                            onClick={() => handleItemClick(item.path)}
                            style={{ textDecoration: 'none' }}
                        >
                            {item.label}
                        </button>
                    ))}
                    <hr className="my-1" style={{ opacity: 0.2 }} />
                    <button
                        type="button"
                        className="btn btn-link w-100 text-start px-3 py-2 text-danger"
                        onClick={handleLogout}
                        style={{ textDecoration: 'none' }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default FloatingMenu;
