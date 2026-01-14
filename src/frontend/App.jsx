import './App.css';
import { Outlet } from 'react-router-dom';
import FloatingMenu from './components/FloatingMenu';

function App() {
    return (
        <div className="App">
            <FloatingMenu />
            <Outlet />
        </div>
    );
}

export default App;