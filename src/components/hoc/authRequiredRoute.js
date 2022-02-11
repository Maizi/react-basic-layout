import React, { Component } from 'react';
import { Route } from 'react-router-dom';

class AuthRequiredRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
          <Route
            path={this.props.path}
            render={(props) => (
              //主要是为了传递嵌套路由到子组件
              <this.props.component
                {...props}
                routes={this.props.routes || []}
              />
            )}
          />
    );
  }
}

export default AuthRequiredRoute;
