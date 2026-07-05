/** 知识主线演示流程 */
export const KNOWLEDGE_FLOW_STEPS = [
  { key: 'deliverable', title: '成果物上传', desc: 'Phase2 任务', icon: '果', path: '/poms/phase2/task', query: { status: 'in_progress' } },
  { key: 'review', title: '成果审核', desc: '审核通过', icon: '审', path: '/poms/phase2/task', query: { status: 'pending_review' } },
  { key: 'archive', title: '自动归档', desc: '同步文档中心', icon: '档', path: '/poms/phase3/document', query: { sourceType: 'auto' } },
  { key: 'document', title: '文档中心', desc: '知识资产库', icon: '文', path: '/poms/phase3/document' },
  { key: 'tag', title: '标签管理', desc: '多维分类', icon: '签', path: '/poms/phase3/tag' },
  { key: 'search', title: '全文检索', desc: '找文件复用', icon: '搜', path: '/poms/phase3/search' },
];

export const MODULE_LINKS = KNOWLEDGE_FLOW_STEPS.filter(s => ['document', 'tag', 'search'].includes(s.key));
