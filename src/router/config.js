import { lazy } from 'react';
const Home = lazy(() => import('../pages/home'));

const routes = [
  {
    path: '/',
    component: Home, // 首页
    exact: true, // 严格匹配，保证刚进来的时候直接展示首页
  }
];

export default routes;
