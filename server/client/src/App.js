import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectLocationPage from './pages/SelectLocation';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: '/login', element: _jsx(AuthPage, {}) }), _jsx(Route, { path: "/locationSelect", element: _jsx(SelectLocationPage, {}) }), _jsx(Route, { path: '/', element: _jsx(Dashboard, {}) })] }) }));
}
export default App;
