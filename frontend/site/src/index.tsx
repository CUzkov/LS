import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { App } from './app/app';
import { store } from './store';

// https://github.com/pbeshai/use-query-params/issues/108
const RouteAdapter = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const adaptedHistory = React.useMemo(
        () => ({
            replace(location) {
                navigate(location, { replace: true, state: location.state });
            },
            push(location) {
                navigate(location, { replace: false, state: location.state });
            },
        }),
        [navigate],
    );
    return children({ history: adaptedHistory, location });
};

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <QueryParamProvider ReactRouterRoute={RouteAdapter}>
                <Provider store={store}>
                    <App />
                </Provider>
            </QueryParamProvider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root'),
);
