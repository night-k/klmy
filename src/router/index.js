import { createRouter, createWebHashHistory } from 'vue-router';
import DemoLayout from '@/layout/DemoLayout.vue';

const children = [
  {
    path: 'index',
    name: '演示首页',
    meta: { title: '演示首页' },
    component: () => import('@/views/poms/phase1/index.vue'),
  },
  {
    path: 'customer',
    name: '客户管理',
    meta: { title: '客户管理' },
    component: () => import('@/views/poms/phase1/customer/index.vue'),
  },
  {
    path: 'opportunity',
    name: '商机管理',
    meta: { title: '商机管理' },
    component: () => import('@/views/poms/phase1/opportunity/index.vue'),
  },
  {
    path: 'tender',
    name: '招投标管理',
    meta: { title: '招投标管理' },
    component: () => import('@/views/poms/phase1/tender/index.vue'),
  },
  {
    path: 'winbid',
    name: '中标管理',
    meta: { title: '中标管理' },
    component: () => import('@/views/poms/phase1/winbid/index.vue'),
  },
  {
    path: 'contract',
    name: '合同管理',
    meta: { title: '合同管理' },
    component: () => import('@/views/poms/phase1/contract/index.vue'),
  },
  {
    path: 'payment',
    name: '回款管理',
    meta: { title: '回款管理' },
    component: () => import('@/views/poms/phase1/paymentCollection/index.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/poms/phase1/index',
    },
    {
      path: '/poms/phase1',
      component: DemoLayout,
      redirect: '/poms/phase1/index',
      meta: { title: '销售管理' },
      children,
    },
  ],
});

router.afterEach(to => {
  const title = to.meta?.title;
  document.title = title ? `${title} | 销售管理演示` : '销售管理演示';
});

export default router;
