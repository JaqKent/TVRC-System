import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  return (
    <Route
      {...rest}
      element={
        localStorage.getItem('token') ? (
          <Element />
        ) : (
          <Navigate to='/users/login' />
        )
      }
    />
  );
};

export default PrivateRoute;
