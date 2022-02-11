import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Switch, Redirect } from 'react-router-dom';
import AuthRequiredRoute from '@components/hoc/authRequiredRoute';
import routes from './router/config';
import history from '@utils/history';
import store from '@store/configureStore';
import CurrentApp from '@containers/index';

const LoadingMessage = () => <div>...</div>;

ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <CurrentApp>
          <Suspense fallback={<LoadingMessage />}>
            <Switch>
              {routes.map((item, index) => {
                return <AuthRequiredRoute {...item} key={index} />;
              })}
              <Redirect from='/*' to='/' />
            </Switch>
          </Suspense>
        </CurrentApp>
      </Router>
    </Provider>,
  document.getElementById('app')
);
