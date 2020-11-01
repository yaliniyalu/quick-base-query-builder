
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Api') },
      { path: 'summary', component: () => import('pages/Summary') },
      { path: 'builder', component: () => import('pages/Builder') },
      { path: 'code', component: () => import('pages/CodeGenerator') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
