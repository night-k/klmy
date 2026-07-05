/**
 * Phase3 知识主线 Mock 数据层（扩展 Phase1 localStorage）
 */
import { loadStore, saveStore } from '../phase1/mockStore';
import { ensurePhase2 } from '../phase2/phase2Store';
import { labelOf, DOC_TYPE } from '@/views/poms/phase3/option/dict';

const pad = (n, len = 3) => String(n).padStart(len, '0');
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const year = () => String(new Date().getFullYear());

function mockResponse(data) {
  return Promise.resolve({ data: { code: 200, success: true, data } });
}

function genId(prefix) {
  const s = loadStore();
  if (!s.counters) s.counters = {};
  const key = prefix;
  s.counters[key] = (s.counters[key] || 0) + 1;
  saveStore();
  return `${prefix}-${pad(s.counters[key])}`;
}

function genDocCode() {
  const s = loadStore();
  if (!s.counters) s.counters = {};
  s.counters.knowledgeDoc = (s.counters.knowledgeDoc || 0) + 1;
  saveStore();
  return `DOC-${year()}-${pad(s.counters.knowledgeDoc, 4)}`;
}

function buildSystemTags(doc) {
  const tags = [];
  if (doc.projectName) tags.push({ name: doc.projectName, dimension: 'project', system: true });
  if (doc.customerName) tags.push({ name: doc.customerName, dimension: 'customer', system: true });
  if (doc.uploadTime) tags.push({ name: String(doc.uploadTime).slice(0, 4), dimension: 'year', system: true });
  if (doc.docType) tags.push({ name: labelOf(DOC_TYPE, doc.docType), dimension: 'docType', system: true });
  return tags;
}

function createPhase3Seed() {
  return {
    knowledgeDocuments: [
      {
        id: 'kdoc-001',
        code: 'DOC-2025-0001',
        name: '2025Q2 平台巡检报告',
        docType: 'deliverable',
        fileFormat: 'pdf',
        projectId: 'project-002',
        projectName: '新疆油田信息化运维项目',
        projectCode: 'PRJ-2025-0088',
        customerId: 'cus-002',
        customerName: '中石油新疆油田公司',
        contractId: 'contract-001',
        contractCode: 'HT-2025-0001',
        taskId: 'task-001',
        deliverableId: 'del-001',
        uploaderId: 'u005',
        uploaderName: '陈强',
        uploadTime: '2025-06-28 16:30:00',
        fileSize: '2.4 MB',
        version: 'v1.0',
        tags: ['新疆油田信息化运维项目', '中石油新疆油田公司', '2025', '成果物', '优秀范本'],
        permissionScope: 'project',
        allowDownload: true,
        sourceType: 'auto',
        remark: '成果审核通过后自动归档',
        contentIndex: '平台巡检 机房环境 网络设备 运行状态 季度报告',
        createTime: '2025-06-28 16:30:00',
      },
      {
        id: 'kdoc-002',
        code: 'DOC-2025-0002',
        name: '新疆油田信息化运维服务合同',
        docType: 'contract',
        fileFormat: 'pdf',
        projectId: 'project-002',
        projectName: '新疆油田信息化运维项目',
        projectCode: 'PRJ-2025-0088',
        customerId: 'cus-002',
        customerName: '中石油新疆油田公司',
        contractId: 'contract-001',
        contractCode: 'HT-2025-0001',
        uploaderId: 'u001',
        uploaderName: '张明',
        uploadTime: '2025-01-05 10:00:00',
        fileSize: '1.8 MB',
        version: 'v1.0',
        tags: ['新疆油田信息化运维项目', '中石油新疆油田公司', '2025', '合同文件'],
        permissionScope: 'project',
        allowDownload: true,
        sourceType: 'auto',
        remark: '合同签订后自动归档',
        contentIndex: '技术服务 合同条款 付款计划 服务范围',
        createTime: '2025-01-05 10:00:00',
      },
      {
        id: 'kdoc-003',
        code: 'DOC-2025-0003',
        name: '信息化运维项目开题报告',
        docType: 'proposal',
        fileFormat: 'word',
        projectId: 'project-002',
        projectName: '新疆油田信息化运维项目',
        projectCode: 'PRJ-2025-0088',
        customerId: 'cus-002',
        customerName: '中石油新疆油田公司',
        uploaderId: 'u002',
        uploaderName: '李华',
        uploadTime: '2025-01-10 14:00:00',
        fileSize: '856 KB',
        version: 'v1.0',
        tags: ['新疆油田信息化运维项目', '中石油新疆油田公司', '2025', '开题报告'],
        permissionScope: 'project',
        allowDownload: true,
        sourceType: 'auto',
        remark: '开题审核通过后自动归档',
        contentIndex: '项目背景 研究目标 技术路线 进度安排',
        createTime: '2025-01-10 14:00:00',
      },
      {
        id: 'kdoc-004',
        code: 'DOC-2025-0004',
        name: '某油田设备维护投标技术方案（范本）',
        docType: 'tender',
        fileFormat: 'word',
        customerId: 'cus-003',
        customerName: '中石化华北油田分公司',
        uploaderId: 'u003',
        uploaderName: '王磊',
        uploadTime: '2025-03-15 09:00:00',
        fileSize: '3.2 MB',
        version: 'v2.0',
        tags: ['中石化华北油田分公司', '2025', '投标文件', '投标可复用', '优秀范本'],
        permissionScope: 'public',
        allowDownload: true,
        sourceType: 'manual',
        remark: '历史中标项目技术方案，可供投标复用',
        contentIndex: '技术方案 设备维护 服务承诺 人员配置 质量保证',
        createTime: '2025-03-15 09:00:00',
      },
    ],
    knowledgeTags: [
      { id: 'tag-001', name: '优秀范本', dimension: 'custom', system: false, docCount: 2, createTime: '2025-03-15 09:00:00' },
      { id: 'tag-002', name: '投标可复用', dimension: 'custom', system: false, docCount: 1, createTime: '2025-03-15 09:00:00' },
      { id: 'tag-003', name: '新疆油田信息化运维项目', dimension: 'project', system: true, docCount: 3, createTime: '2025-01-05 10:00:00' },
      { id: 'tag-004', name: '中石油新疆油田公司', dimension: 'customer', system: true, docCount: 3, createTime: '2025-01-05 10:00:00' },
      { id: 'tag-005', name: '成果物', dimension: 'docType', system: true, docCount: 1, createTime: '2025-06-28 16:30:00' },
    ],
    counters: { knowledgeDoc: 4, knowledgeTag: 5 },
  };
}

export function ensurePhase3() {
  const s = loadStore();
  if (!Array.isArray(s.knowledgeDocuments)) {
    s.knowledgeDocuments = [];
  }
  if (!Array.isArray(s.knowledgeTags)) {
    s.knowledgeTags = [];
  }
  if (!s.counters) s.counters = {};
  const needSeed = !s._phase3Seeded || s.knowledgeDocuments.length === 0;
  if (needSeed) {
    const seed = createPhase3Seed();
    s.knowledgeDocuments = seed.knowledgeDocuments;
    s.knowledgeTags = seed.knowledgeTags;
    Object.assign(s.counters, seed.counters);
    s._phase3Seeded = true;
    saveStore();
  }
  return s;
}

/** 将 Phase2 已审核通过的成果物同步到文档中心（幂等） */
export function syncApprovedDeliverables() {
  const s = ensurePhase3();
  const p2 = ensurePhase2();
  const store = loadStore();
  const projects = store.projects || [];
  (p2.deliverables || [])
    .filter(d => d.auditStatus === 'approved')
    .forEach(del => {
      const exists = s.knowledgeDocuments.some(k => k.deliverableId === del.id);
      if (exists) return;
      const task = (p2.tasks || []).find(t => t.id === del.taskId);
      const project = projects.find(p => p.id === del.projectId);
      archiveDeliverable(del, task, project);
    });
}

export function archiveDeliverable(deliverable, task, project) {
  const s = loadStore();
  if (!Array.isArray(s.knowledgeDocuments)) s.knowledgeDocuments = [];
  const p = project || loadStore().projects?.find(x => x.id === deliverable.projectId);
  const doc = {
    id: genId('kdoc'),
    code: genDocCode(),
    name: deliverable.name,
    docType: 'deliverable',
    fileFormat: 'pdf',
    projectId: deliverable.projectId,
    projectName: p?.projectName || '',
    projectCode: p?.code || '',
    customerId: p?.customerId || '',
    customerName: p?.customerName || '',
    contractId: p?.contractId || '',
    contractCode: p?.contractCode || '',
    taskId: deliverable.taskId,
    deliverableId: deliverable.id,
    uploaderId: task?.assigneeId || '',
    uploaderName: deliverable.uploaderName || task?.assigneeName || '',
    uploadTime: now(),
    fileSize: '1.2 MB',
    version: deliverable.version || 'v1.0',
    tags: [],
    permissionScope: deliverable.projectId ? 'project' : 'public',
    allowDownload: true,
    sourceType: 'auto',
    remark: '成果审核通过后自动归档',
    contentIndex: `${deliverable.name} ${task?.taskName || ''} ${task?.description || ''}`,
    createTime: now(),
  };
  doc.tags = buildSystemTags(doc).map(t => t.name);
  s.knowledgeDocuments.unshift(doc);
  refreshTagCounts(s);
  saveStore();
  return doc;
}

function refreshTagCounts(s) {
  const tagMap = {};
  s.knowledgeDocuments.forEach(doc => {
    (doc.tags || []).forEach(name => {
      tagMap[name] = (tagMap[name] || 0) + 1;
    });
  });
  s.knowledgeTags.forEach(tag => {
    tag.docCount = tagMap[tag.name] || 0;
  });
}

function paginate(list, current = 1, size = 10) {
  const start = (current - 1) * size;
  return { records: list.slice(start, start + size), total: list.length, current, size };
}

function filterDocuments(list, params = {}) {
  let result = [...list];
  if (params.docType) result = result.filter(i => i.docType === params.docType);
  if (params.sourceType) result = result.filter(i => i.sourceType === params.sourceType);
  if (params.permissionScope) result = result.filter(i => i.permissionScope === params.permissionScope);
  if (params.projectId) result = result.filter(i => i.projectId === params.projectId);
  if (params.tag) result = result.filter(i => (i.tags || []).includes(params.tag));
  if (params.keyword) {
    const kw = String(params.keyword).toLowerCase();
    result = result.filter(i =>
      [i.name, i.code, i.projectName, i.customerName, i.uploaderName, i.remark, i.contentIndex, ...(i.tags || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(kw)),
    );
  }
  if (params.docName) result = result.filter(i => String(i.name).includes(params.docName));
  return result;
}

export function getPhase3Stats() {
  const s = ensurePhase3();
  return {
    documents: s.knowledgeDocuments.length,
    tags: s.knowledgeTags.length,
    autoArchived: s.knowledgeDocuments.filter(d => d.sourceType === 'auto').length,
    manualUploaded: s.knowledgeDocuments.filter(d => d.sourceType === 'manual').length,
    publicDocs: s.knowledgeDocuments.filter(d => d.permissionScope === 'public').length,
    deliverableDocs: s.knowledgeDocuments.filter(d => d.docType === 'deliverable').length,
  };
}

export function resetPhase3DemoData() {
  const s = loadStore();
  delete s._phase3Seeded;
  delete s.knowledgeDocuments;
  delete s.knowledgeTags;
  if (s.counters) {
    delete s.counters.knowledgeDoc;
    delete s.counters.knowledgeTag;
  }
  saveStore();
  ensurePhase3();
  return mockResponse(true);
}

export function searchDocuments(params = {}) {
  const s = ensurePhase3();
  let list = filterDocuments(s.knowledgeDocuments, params);
  const kw = params.keyword || params.q || '';
  if (kw) {
    list = list
      .map(doc => {
        const lower = String(kw).toLowerCase();
        let snippet = doc.remark || '';
        const idx = (doc.contentIndex || '').toLowerCase().indexOf(lower);
        if (idx >= 0) {
          snippet = (doc.contentIndex || '').slice(Math.max(0, idx - 10), idx + 40);
        }
        const score = [doc.name, doc.contentIndex, ...(doc.tags || [])].join(' ').toLowerCase().includes(lower) ? 1 : 0.5;
        return { ...doc, hitSnippet: snippet, relevance: score };
      })
      .sort((a, b) => b.relevance - a.relevance);
  }
  list.sort((a, b) => (b.uploadTime || '').localeCompare(a.uploadTime || ''));
  return mockResponse(paginate(list, params.current || 1, params.size || 10));
}

export function createDocumentCrud() {
  return {
    getPage(current, size, params = {}) {
      const s = ensurePhase3();
      let list = filterDocuments(s.knowledgeDocuments, params);
      list.sort((a, b) => (b.uploadTime || '').localeCompare(a.uploadTime || ''));
      return mockResponse(paginate(list, current, size));
    },
    getDetail(id) {
      const s = ensurePhase3();
      return mockResponse(s.knowledgeDocuments.find(i => i.id === id) || null);
    },
    add(row) {
      const s = ensurePhase3();
      const store = loadStore();
      const project = row.projectId ? store.projects?.find(p => p.id === row.projectId) : null;
      const item = {
        ...row,
        id: genId('kdoc'),
        code: genDocCode(),
        projectName: project?.projectName || row.projectName || '',
        projectCode: project?.code || row.projectCode || '',
        customerName: project?.customerName || row.customerName || '',
        uploaderName: row.uploaderName || '演示用户',
        uploadTime: now(),
        createTime: now(),
        sourceType: 'manual',
        tags: Array.isArray(row.tags) ? row.tags : row.tags ? String(row.tags).split(',') : [],
      };
      const sysTags = buildSystemTags(item).map(t => t.name);
      item.tags = [...new Set([...sysTags, ...item.tags])];
      s.knowledgeDocuments.unshift(item);
      refreshTagCounts(s);
      saveStore();
      return mockResponse(item);
    },
    update(row) {
      const s = ensurePhase3();
      const idx = s.knowledgeDocuments.findIndex(i => i.id === row.id);
      if (idx >= 0) {
        s.knowledgeDocuments[idx] = { ...s.knowledgeDocuments[idx], ...row };
        refreshTagCounts(s);
        saveStore();
        return mockResponse(s.knowledgeDocuments[idx]);
      }
      return mockResponse(null);
    },
    remove(ids) {
      const s = ensurePhase3();
      const idArr = String(ids).split(',');
      s.knowledgeDocuments = s.knowledgeDocuments.filter(i => !idArr.includes(i.id));
      refreshTagCounts(s);
      saveStore();
      return mockResponse(true);
    },
  };
}

export function createTagCrud() {
  return {
    getPage(current, size, params = {}) {
      const s = ensurePhase3();
      let list = [...s.knowledgeTags];
      if (params.dimension) list = list.filter(i => i.dimension === params.dimension);
      if (params.name) list = list.filter(i => String(i.name).includes(params.name));
      list.sort((a, b) => (b.docCount || 0) - (a.docCount || 0));
      return mockResponse(paginate(list, current, size));
    },
    add(row) {
      const s = ensurePhase3();
      const item = {
        ...row,
        id: genId('tag'),
        system: false,
        dimension: 'custom',
        docCount: 0,
        createTime: now(),
      };
      s.knowledgeTags.unshift(item);
      saveStore();
      return mockResponse(item);
    },
    update(row) {
      const s = ensurePhase3();
      const idx = s.knowledgeTags.findIndex(i => i.id === row.id);
      if (idx >= 0 && !s.knowledgeTags[idx].system) {
        s.knowledgeTags[idx] = { ...s.knowledgeTags[idx], ...row };
        saveStore();
        return mockResponse(s.knowledgeTags[idx]);
      }
      return mockResponse(null);
    },
    remove(ids) {
      const s = ensurePhase3();
      const idArr = String(ids).split(',');
      s.knowledgeDocuments.forEach(doc => {
        const removed = s.knowledgeTags.filter(t => idArr.includes(t.id)).map(t => t.name);
        doc.tags = (doc.tags || []).filter(n => !removed.includes(n));
      });
      s.knowledgeTags = s.knowledgeTags.filter(i => !idArr.includes(i.id) || i.system);
      refreshTagCounts(s);
      saveStore();
      return mockResponse(true);
    },
  };
}

export function getTagSuggestions(keyword = '') {
  const s = ensurePhase3();
  const kw = String(keyword).toLowerCase();
  const names = s.knowledgeTags.map(t => t.name).filter(n => !kw || n.toLowerCase().includes(kw));
  return mockResponse([...new Set(names)].slice(0, 20));
}
