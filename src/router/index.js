import { createRouter, createWebHashHistory } from 'vue-router';
import DemoLayout from '@/layout/DemoLayout.vue';
import PomsDemoLayout from '@/layout/PomsDemoLayout.vue';

const phase1Children = [
  { path: 'index', name: 'PomsPhase1Demo', meta: { title: '演示首页' }, component: () => import('@/views/poms/phase1/index.vue') },
  { path: 'customer', name: 'PomsPhase1Customer', meta: { title: '客户管理' }, component: () => import('@/views/poms/phase1/customer/index.vue') },
  { path: 'opportunity', name: 'PomsPhase1Opportunity', meta: { title: '商机管理' }, component: () => import('@/views/poms/phase1/opportunity/index.vue') },
  { path: 'tender', name: 'PomsPhase1Tender', meta: { title: '招投标管理' }, component: () => import('@/views/poms/phase1/tender/index.vue') },
  { path: 'winbid', name: 'PomsPhase1Winbid', meta: { title: '中标管理' }, component: () => import('@/views/poms/phase1/winbid/index.vue') },
  { path: 'contract', name: 'PomsPhase1Contract', meta: { title: '合同管理' }, component: () => import('@/views/poms/phase1/contract/index.vue') },
  { path: 'payment', name: 'PomsPhase1Payment', meta: { title: '回款管理' }, component: () => import('@/views/poms/phase1/paymentCollection/index.vue') },
];

const phase2Children = [
  { path: 'index', name: 'PomsPhase2Demo', meta: { title: '项目演示首页' }, component: () => import('@/views/poms/phase2/index.vue') },
  { path: 'projectList', name: 'PomsPhase2ProjectList', meta: { title: '项目列表' }, component: () => import('@/views/poms/phase2/projectList/index.vue') },
  { path: 'projectSpace', name: 'PomsPhase2ProjectSpaceEntry', meta: { title: '项目空间' }, component: () => import('@/views/poms/phase2/projectSpace/entry.vue') },
  { path: 'projectSpace/:id', name: 'PomsPhase2ProjectSpaceDetail', meta: { title: '项目空间详情' }, component: () => import('@/views/poms/phase2/projectSpace/index.vue') },
  { path: 'proposal', name: 'PomsPhase2Proposal', meta: { title: '开题报告' }, component: () => import('@/views/poms/phase2/proposal/index.vue') },
  { path: 'plan', name: 'PomsPhase2Plan', meta: { title: '项目计划' }, component: () => import('@/views/poms/phase2/plan/index.vue') },
  { path: 'gantt', name: 'PomsPhase2Gantt', meta: { title: '项目甘特图' }, component: () => import('@/views/poms/phase2/gantt/index.vue') },
  { path: 'task', name: 'PomsPhase2Task', meta: { title: '项目任务' }, component: () => import('@/views/poms/phase2/task/index.vue') },
  {
    path: 'deliverable',
    redirect: to => ({ path: '/poms/phase2/task', query: { ...to.query, status: 'in_progress' } }),
  },
  {
    path: 'review',
    redirect: to => ({ path: '/poms/phase2/task', query: { ...to.query, status: 'pending_review' } }),
  },
  {
    path: 'acceptance',
    redirect: to => {
      const q = { ...to.query, tab: 'acceptance' };
      if (q.projectId) {
        return { path: `/poms/phase2/projectSpace/${q.projectId}`, query: { tab: 'acceptance' } };
      }
      return { path: '/poms/phase2/projectSpace', query: q };
    },
  },
];

const phase3Children = [
  { path: 'index', name: 'PomsPhase3Demo', meta: { title: '知识演示首页' }, component: () => import('@/views/poms/phase3/index.vue') },
  { path: 'document', name: 'PomsPhase3Document', meta: { title: '文档中心' }, component: () => import('@/views/poms/phase3/document/index.vue') },
  { path: 'tag', name: 'PomsPhase3Tag', meta: { title: '标签管理' }, component: () => import('@/views/poms/phase3/tag/index.vue') },
  { path: 'search', name: 'PomsPhase3Search', meta: { title: '全文搜索' }, component: () => import('@/views/poms/phase3/search/index.vue') },
];

const phase4Children = [
  { path: 'index', name: 'PomsPhase4Demo', meta: { title: '人才主线演示首页' }, component: () => import('@/views/poms/phase4/index.vue') },
  { path: 'candidate', name: 'PomsPhase4Candidate', meta: { title: '候选人池' }, component: () => import('@/views/poms/phase4/candidate/index.vue') },
  { path: 'talent', name: 'PomsPhase4Talent', meta: { title: '人才档案' }, component: () => import('@/views/poms/phase4/talent/index.vue') },
  { path: 'resume', name: 'PomsPhase4Resume', meta: { title: '简历生成' }, component: () => import('@/views/poms/phase4/resume/index.vue') },
  { path: 'bid', name: 'PomsPhase4Bid', meta: { title: '投标包' }, component: () => import('@/views/poms/phase4/bid/index.vue') },
  { path: 'template', name: 'PomsPhase4Template', meta: { title: '模板管理' }, component: () => import('@/views/poms/phase4/template/index.vue') },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/poms/phase1/index' },
    { path: '/poms/phase/index4', redirect: '/poms/phase4/index' },
    {
      path: '/poms/phase1',
      component: DemoLayout,
      redirect: '/poms/phase1/index',
      meta: { title: '销售管理' },
      children: phase1Children,
    },
    {
      path: '/poms/phase2',
      component: PomsDemoLayout,
      redirect: '/poms/phase2/index',
      meta: { title: '项目管理' },
      children: phase2Children,
    },
    {
      path: '/poms/phase3',
      component: PomsDemoLayout,
      redirect: '/poms/phase3/index',
      meta: { title: '知识管理' },
      children: phase3Children,
    },
    {
      path: '/poms/phase4',
      component: PomsDemoLayout,
      redirect: '/poms/phase4/index',
      meta: { title: '人才管理' },
      children: phase4Children,
    },
  ],
});

router.afterEach(to => {
  const title = to.meta?.title;
  document.title = title ? `${title} | POMS Mock 演示` : 'POMS Mock 演示';
});

export default router;
