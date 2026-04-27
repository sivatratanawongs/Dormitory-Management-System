import { lazy } from 'react';

export const ownerRoutes = [
  {
    path: '/owner',
    component: lazy(() => import('../Owner/owner')), 
    children: [
      {
        path: 'settings', 
        component: lazy(() => import('../Owner/Menu/setting/settingPage')), 
      },
      {
        index: true,
        component: lazy(() => import('../Owner/Menu/billing/billing')), 
      },
      {
        path: 'contracts', 
        component: lazy(() => import('../Owner/Menu/tenant/contract')), 
      },
      { path: 'tenants-detail/:id',
        component: lazy(() => import('../Owner/Menu/tenant/tenantDetail')) 
      },
      {
        path: 'tenants', 
        component: lazy(() => import('../Owner/Menu/tenant/tenant')), 
      },
      {
        path: 'history', 
        component: lazy(() => import('../Owner/Menu/history/historyPage')), 
      }
    ]
  }
];