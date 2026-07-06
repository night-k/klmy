const STORAGE_KEY = 'poms-phase4-demo';

const pad = (n, len = 4) => String(n).padStart(len, '0');
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const ym = () => {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}`;
};
const year = () => String(new Date().getFullYear());

const candidateStatusFlow = ['new', 'interview', 'offer', 'hired'];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function calcPackageStatus(pkg) {
  const count = (pkg.candidateIds || []).length;
  return count >= (pkg.requiredRoles || 0) ? 'ready' : 'draft';
}

function genCode(type) {
  const s = loadStore();
  s.counters[type] = (s.counters[type] || 0) + 1;
  const n = s.counters[type];
  if (type === 'candidate') return `CAN-${ym()}-${pad(n)}`;
  if (type === 'talent') return `TAL-${year()}-${pad(n)}`;
  if (type === 'resume') return `RES-${ym()}-${pad(n)}`;
  if (type === 'bidPackage') return `BID-${ym()}-${pad(n)}`;
  if (type === 'template') return `TPL-${year()}-${pad(n)}`;
  return `ID-${n}`;
}

function createSeedData() {
  const c1Id = 'cand-001';
  const c2Id = 'cand-002';
  const c3Id = 'cand-003';
  const c4Id = 'cand-004';
  const c5Id = 'cand-005';
  const talLegacyId = 'tal-003';
  const tplResA = 'tpl-res-001';
  const tplResB = 'tpl-res-002';
  const tplResC = 'tpl-res-003';
  const tplBidA = 'tpl-bid-001';
  const tplBidB = 'tpl-bid-002';

  return {
    counters: {
      candidate: 5,
      talent: 3,
      resume: 4,
      bidPackage: 2,
      template: 5,
    },
    templates: [
      {
        id: tplResA,
        code: 'TPL-2026-0001',
        name: '投标简历模板 A',
        type: 'resume',
        description: '标准技术人员投标简历，含技能与项目经历区块',
        fileName: '投标简历模板A.docx',
        templateFile: null,
        status: 'active',
        usageCount: 2,
        createTime: '2026-06-01 10:00:00',
      },
      {
        id: tplResB,
        code: 'TPL-2026-0002',
        name: '投标简历模板 B',
        type: 'resume',
        description: '数据处理类岗位简历模板',
        fileName: '投标简历模板B.docx',
        templateFile: null,
        status: 'active',
        usageCount: 1,
        createTime: '2026-06-05 14:00:00',
      },
      {
        id: tplResC,
        code: 'TPL-2026-0003',
        name: '投标简历模板 C',
        type: 'resume',
        description: '资深专家/管理岗简历模板',
        fileName: '投标简历模板C.docx',
        templateFile: null,
        status: 'active',
        usageCount: 1,
        createTime: '2026-06-10 09:00:00',
      },
      {
        id: tplBidA,
        code: 'TPL-2026-0004',
        name: '技术服务投标模板',
        type: 'bid',
        description: '技术服务类项目投标书主模板',
        fileName: '技术服务投标模板.docx',
        templateFile: null,
        status: 'active',
        usageCount: 1,
        createTime: '2026-05-20 11:00:00',
      },
      {
        id: tplBidB,
        code: 'TPL-2026-0005',
        name: '咨询类投标模板',
        type: 'bid',
        description: '咨询类项目投标书模板，含商务与技术分册结构',
        fileName: '咨询类投标模板.docx',
        templateFile: null,
        status: 'active',
        usageCount: 1,
        createTime: '2026-05-25 15:00:00',
      },
    ],
    certificateCatalog: [
      { id: 'cert-001', certName: 'PMP', certType: '20', certDesc: '项目管理专业人士资格', certifiedToWork: '0', checkValidity: 1, enable: '1' },
      { id: 'cert-002', certName: '注册岩土工程师', certType: '10', certDesc: '岩土工程注册执业资格', certifiedToWork: '1', checkValidity: 1, enable: '1' },
      { id: 'cert-003', certName: '英语六级', certType: '30', certDesc: '大学英语六级', certifiedToWork: '0', checkValidity: 0, enable: '1' },
      { id: 'cert-004', certName: '招标师', certType: '20', certDesc: '招标采购从业人员资格', certifiedToWork: '0', checkValidity: 1, enable: '1' },
      { id: 'cert-005', certName: '安全生产考核合格证', certType: '10', certDesc: '安全生产管理考核合格', certifiedToWork: '1', checkValidity: 1, enable: '1' },
      { id: 'cert-006', certName: 'Oracle OCP', certType: '40', certDesc: 'Oracle 数据库认证专家', certifiedToWork: '0', checkValidity: 1, enable: '1' },
    ],
    recruitmentEmails: [
      {
        id: 'mail-001',
        subject: '【简历投递】李晓晨 - 地质建模工程师',
        sender: 'xiachen.li@example.com',
        candidateName: '李晓晨',
        position: '地质建模工程师',
        receivedAt: '2026-07-03 09:10:00',
        attachments: 1,
        source: '招聘邮箱',
        processed: true,
        candidateId: c1Id,
      },
      {
        id: 'mail-002',
        subject: '【内推】周雨 - 数据处理工程师',
        sender: 'hr@partner.com',
        candidateName: '周雨',
        position: '数据处理工程师',
        receivedAt: '2026-07-02 16:05:00',
        attachments: 2,
        source: '内推',
        processed: true,
        candidateId: c2Id,
      },
      {
        id: 'mail-003',
        subject: '【校招】王远 - 解释建模工程师',
        sender: 'campus@edu.cn',
        candidateName: '王远',
        position: '解释建模工程师',
        receivedAt: '2026-06-30 11:40:00',
        attachments: 1,
        source: '校园招聘',
        processed: true,
        candidateId: c3Id,
      },
    ],
    candidates: [
      {
        id: c1Id,
        code: 'CAN-202607-0001',
        name: '李晓晨',
        position: '地质建模工程师',
        source: '招聘邮箱',
        status: 'new',
        education: '硕士',
        experienceYears: 5,
        phone: '13800001111',
        email: 'xiachen.li@example.com',
        interviewScore: 0,
        skills: ['Petrel', 'Python', '三维建模'],
        summary: '5 年地质建模经验，熟悉 Petrel 三维建模与储层参数解释。',
        certificateBindings: [
          {
            _key: 'cb-001',
            certificateId: 'cert-002',
            certName: '注册岩土工程师',
            certType: '10',
            certNo: 'KY-2018-12001',
            issuingAuthority: '住建部',
            issueDate: '2018-06-20',
            validTo: '2028-06-20',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['塔里木盆地储层建模项目'],
        resumeGenerated: false,
        lastTouch: '邮箱简历已入库，待 HR 初筛',
        history: [
          { time: '2026-07-03 09:10:00', action: '收到简历', detail: '招聘邮箱自动接收附件简历' },
          { time: '2026-07-03 09:30:00', action: '人工登记', detail: '补充岗位和联系方式' },
        ],
      },
      {
        id: c2Id,
        code: 'CAN-202607-0002',
        name: '周雨',
        position: '数据处理工程师',
        source: '内推',
        status: 'interview',
        education: '本科',
        experienceYears: 3,
        phone: '13900002222',
        email: 'zhouyu@example.com',
        interviewScore: 82,
        skills: ['数据清洗', 'SQL', '报告编制'],
        summary: '3 年数据处理与报告编制经验，擅长 SQL 与数据质量治理。',
        certificateBindings: [
          {
            _key: 'cb-002',
            certificateId: 'cert-001',
            certName: 'PMP',
            certType: '20',
            certNo: 'PMP-2023-22001',
            issuingAuthority: 'PMI',
            issueDate: '2023-03-10',
            validTo: '2029-03-10',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['油田生产数据治理项目'],
        resumeGenerated: false,
        interviewTime: '2026-07-03 14:00:00',
        lastTouch: '一面通过，等待二面',
        history: [
          { time: '2026-07-02 16:05:00', action: '内推入库', detail: '来自合作方推荐' },
          { time: '2026-07-03 14:00:00', action: '初面', detail: '技术与表达表现良好' },
        ],
      },
      {
        id: c3Id,
        code: 'CAN-202607-0003',
        name: '王远',
        position: '解释建模工程师',
        source: '校园招聘',
        status: 'offer',
        education: '硕士',
        experienceYears: 4,
        phone: '13700003333',
        email: 'wangyuan@example.com',
        interviewScore: 91,
        skills: ['解释建模', 'Matlab', '成果汇编'],
        summary: '解释建模方向应届硕士，具备 Matlab 脚本开发与成果汇编能力。',
        certificateBindings: [
          {
            _key: 'cb-003',
            certificateId: 'cert-003',
            certName: '英语六级',
            certType: '30',
            certNo: 'CET6-20200618',
            issuingAuthority: '教育部考试中心',
            issueDate: '2020-06-18',
            validTo: '长期有效',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['储层评价咨询项目（实习）'],
        resumeGenerated: true,
        hiredAt: '',
        lastTouch: '录用函已发出，等待确认',
        history: [
          { time: '2026-06-30 11:40:00', action: '简历投递', detail: '校园招聘邮箱收到应届简历' },
          { time: '2026-07-01 10:20:00', action: '复试', detail: '通过专业复试' },
          { time: '2026-07-03 17:30:00', action: '发放 Offer', detail: '准备进入人才档案' },
        ],
      },
      {
        id: c4Id,
        code: 'CAN-202607-0004',
        name: '赵静',
        position: '项目经理助理',
        source: '猎头推荐',
        status: 'hired',
        education: '本科',
        experienceYears: 6,
        phone: '13600004444',
        email: 'zhaojing@example.com',
        interviewScore: 88,
        skills: ['沟通协调', '排期', '文档管理'],
        summary: '6 年项目管理协调经验，熟悉技术服务类项目投标支持。',
        certificateBindings: [
          {
            _key: 'cb-004',
            certificateId: 'cert-001',
            certName: 'PMP',
            certType: '20',
            certNo: 'PMP-2021-88901',
            issuingAuthority: 'PMI',
            issueDate: '2021-08-15',
            validTo: '2027-08-15',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['新疆油田地质建模技术服务'],
        resumeGenerated: true,
        hiredAt: '2026-06-29 18:00:00',
        lastTouch: '已录用并完成入职资料提交',
        history: [
          { time: '2026-06-25 09:00:00', action: '猎头推荐', detail: '收到候选人简历' },
          { time: '2026-06-27 15:00:00', action: '终面通过', detail: '进入录用审批' },
          { time: '2026-06-29 18:00:00', action: '录用完成', detail: '同步人才档案' },
        ],
      },
      {
        id: c5Id,
        code: 'CAN-202607-0005',
        name: '黄磊',
        position: '测井解释工程师',
        source: '招聘邮箱',
        status: 'rejected',
        education: '本科',
        experienceYears: 2,
        phone: '13500005555',
        email: 'huanglei@example.com',
        interviewScore: 60,
        skills: ['测井', '图表分析'],
        summary: '2 年测井解释经验，专业方向与当前投标岗位匹配度一般。',
        certificateBindings: [],
        resumeGenerated: false,
        lastTouch: '专业方向不匹配，暂缓跟进',
        rejectReason: '项目经验与当前投标方向匹配度较低',
        history: [
          { time: '2026-07-01 10:30:00', action: '简历收到', detail: '附件简历已解析' },
          { time: '2026-07-02 09:20:00', action: '初筛淘汰', detail: '不进入面试' },
        ],
      },
    ],
    talents: [
      {
        id: c4Id,
        sourceCandidateId: c4Id,
        code: 'TAL-2026-0001',
        name: '赵静',
        title: '项目经理助理',
        deptName: '项目管理部',
        education: '本科',
        phone: '13600004444',
        email: 'zhaojing@example.com',
        experienceYears: 6,
        summary: '6 年项目管理与投标协调经验，熟悉技术服务类项目全流程。',
        skills: ['沟通协调', '排期', '文档管理'],
        certificateBindings: [
          {
            _key: 'tb-001',
            certificateId: 'cert-001',
            certName: 'PMP',
            certType: '20',
            certNo: 'PMP-2021-88901',
            issuingAuthority: 'PMI',
            issueDate: '2021-08-15',
            validTo: '2027-08-15',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['新疆油田地质建模技术服务', '西北油田联合投标协调'],
        resumeHits: 3,
        resumeGenerated: true,
        createTime: '2026-06-29 18:00:00',
      },
      {
        id: c3Id,
        sourceCandidateId: c3Id,
        code: 'TAL-2026-0002',
        name: '王远',
        title: '解释建模工程师',
        deptName: '地质研究部',
        education: '硕士',
        phone: '13700003333',
        email: 'wangyuan@example.com',
        experienceYears: 4,
        summary: '解释建模与成果汇编方向，具备油田技术服务项目经验。',
        skills: ['解释建模', 'Matlab', '成果汇编'],
        certificateBindings: [
          {
            _key: 'tb-002',
            certificateId: 'cert-003',
            certName: '英语六级',
            certType: '30',
            certNo: 'CET6-20190618',
            issuingAuthority: '教育部考试中心',
            issueDate: '2019-06-18',
            validTo: '长期有效',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['储层评价咨询项目'],
        resumeHits: 2,
        resumeGenerated: true,
        createTime: '2026-07-03 17:30:00',
      },
      {
        id: talLegacyId,
        sourceCandidateId: '',
        code: 'TAL-2026-0003',
        name: '马宁',
        title: '投标方案工程师',
        deptName: '市场经营部',
        education: '本科',
        phone: '13500006666',
        email: 'maning@example.com',
        experienceYears: 7,
        summary: '长期负责技术服务类投标方案编制，熟悉商务标与技术标协同。',
        skills: ['投标文件', '技术方案', '商务表达'],
        certificateBindings: [
          {
            _key: 'tb-003',
            certificateId: 'cert-001',
            certName: 'PMP',
            certType: '20',
            certNo: 'PMP-2019-55602',
            issuingAuthority: 'PMI',
            issueDate: '2019-11-20',
            validTo: '2025-11-20',
            status: '即将过期',
            attach: null,
          },
          {
            _key: 'tb-004',
            certificateId: 'cert-004',
            certName: '招标师',
            certType: '20',
            certNo: 'ZB-2020-11203',
            issuingAuthority: '中国招标协会',
            issueDate: '2020-05-10',
            validTo: '2026-05-10',
            status: '正常',
            attach: null,
          },
        ],
        projectCases: ['西北油田技术服务联合投标', '克拉玛依智慧油田方案投标'],
        resumeHits: 5,
        resumeGenerated: true,
        createTime: '2026-05-20 12:00:00',
      },
    ],
    resumes: [
      {
        id: 'resume-001',
        memberId: c3Id,
        candidateId: c3Id,
        memberType: 'candidate',
        candidateName: '王远',
        templateId: tplResA,
        templateName: '投标简历模板 A',
        fileName: '王远_投标简历.pdf',
        matchRate: 91,
        generatedAt: '2026-07-03 17:30:00',
      },
      {
        id: 'resume-002',
        memberId: c4Id,
        candidateId: c4Id,
        memberType: 'candidate',
        candidateName: '赵静',
        templateId: tplResA,
        templateName: '投标简历模板 A',
        fileName: '赵静_投标简历.pdf',
        matchRate: 88,
        generatedAt: '2026-06-29 18:05:00',
      },
      {
        id: 'resume-003',
        memberId: c2Id,
        candidateId: c2Id,
        memberType: 'candidate',
        candidateName: '周雨',
        templateId: tplResB,
        templateName: '投标简历模板 B',
        fileName: '周雨_投标简历.pdf',
        matchRate: 82,
        generatedAt: '2026-07-03 15:10:00',
      },
      {
        id: 'resume-004',
        memberId: talLegacyId,
        candidateId: talLegacyId,
        memberType: 'talent',
        candidateName: '马宁',
        templateId: tplResC,
        templateName: '投标简历模板 C',
        fileName: '马宁_投标简历.pdf',
        matchRate: 95,
        generatedAt: '2026-06-15 10:00:00',
      },
    ],
    bidPackages: [
      {
        id: 'bid-001',
        code: 'BID-202607-0001',
        projectName: '新疆油田地质建模技术服务',
        customerName: '中石油新疆油田公司',
        templateId: tplBidA,
        templateName: '技术服务投标模板',
        candidateIds: [c3Id, c4Id],
        requiredRoles: 3,
        status: 'draft',
        updatedAt: '2026-07-03 17:30:00',
      },
      {
        id: 'bid-002',
        code: 'BID-202607-0002',
        projectName: '储层评价咨询项目',
        customerName: '新疆能源集团',
        templateId: tplBidB,
        templateName: '咨询类投标模板',
        candidateIds: [c3Id, talLegacyId, c4Id],
        requiredRoles: 3,
        status: 'ready',
        updatedAt: '2026-07-02 18:20:00',
      },
    ],
  };
}

let cache = null;

function migrateLegacyStore(s) {
  const seed = createSeedData();
  let changed = false;
  if (!s.certificateCatalog?.length) {
    s.certificateCatalog = seed.certificateCatalog;
    changed = true;
  }
  if (s.talents?.length) {
    s.talents = s.talents.map(talent => {
      if (talent.certificateBindings?.length) return talent;
      if (talent.certificates?.length) {
        changed = true;
        const { certificates, ...rest } = talent;
        return { ...rest, certificateBindings: buildCertsFromNames(s, certificates) };
      }
      if (!talent.certificateBindings) {
        changed = true;
        return { ...talent, certificateBindings: [] };
      }
      return talent;
    });
  }
  if (s.candidates?.length) {
    s.candidates = s.candidates.map(candidate => {
      if (candidate.certificateBindings?.length) return candidate;
      if (candidate.certificates?.length) {
        changed = true;
        const { certificates, ...rest } = candidate;
        return { ...rest, certificateBindings: buildCertsFromNames(s, certificates) };
      }
      if (!candidate.certificateBindings) {
        changed = true;
        return { ...candidate, certificateBindings: [] };
      }
      return candidate;
    });
  }
  if (changed) saveStore();
}

function loadStore() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      migrateLegacyStore(cache);
      return cache;
    }
  } catch (e) {
    console.warn('主线四演示数据加载失败', e);
  }
  cache = createSeedData();
  saveStore();
  return cache;
}

function saveStore() {
  if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function findTemplate(s, id) {
  return (s.templates || []).find(item => item.id === id);
}

function findCatalogCert(s, id) {
  return (s.certificateCatalog || []).find(item => item.id === id);
}

function findCatalogByName(s, name) {
  return (s.certificateCatalog || []).find(item => item.certName === name);
}

export function calcCertStatus(validTo) {
  if (!validTo || validTo === '长期有效') return '正常';
  const end = new Date(`${validTo}T23:59:59`);
  if (Number.isNaN(end.getTime())) return '正常';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (end < today) return '已过期';
  const warn = new Date(today);
  warn.setDate(warn.getDate() + 90);
  if (end <= warn) return '即将过期';
  return '正常';
}

function buildCertBinding(s, partial = {}) {
  const catalog = partial.certificateId ? findCatalogCert(s, partial.certificateId) : findCatalogByName(s, partial.certName);
  const validTo = partial.validTo || '长期有效';
  return {
    _key: partial._key || `tb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    certificateId: partial.certificateId || catalog?.id || '',
    certName: partial.certName || catalog?.certName || '',
    certType: partial.certType || catalog?.certType || '20',
    certNo: partial.certNo || '',
    issuingAuthority: partial.issuingAuthority || '',
    issueDate: partial.issueDate || '',
    validTo,
    status: calcCertStatus(validTo),
    attach: partial.attach || null,
  };
}

function buildCertsFromNames(s, names = []) {
  return names.map(name => buildCertBinding(s, { certName: name, validTo: '长期有效' }));
}

function normalizeTalentRecord(s, talent) {
  if (!talent) return null;
  const item = { ...talent };
  if (!item.certificateBindings?.length && item.certificates?.length) {
    item.certificateBindings = typeof item.certificates[0] === 'string' ? buildCertsFromNames(s, item.certificates) : item.certificates;
  }
  item.certificateBindings = (item.certificateBindings || []).map(line => {
    const validTo = line.validTo || '长期有效';
    return { ...line, status: calcCertStatus(validTo) };
  });
  item.certCount = item.certificateBindings.length;
  item.certExpiringCount = item.certificateBindings.filter(line => line.status === '即将过期').length;
  delete item.certificates;
  return item;
}

export function getCertificateCatalog() {
  const s = loadStore();
  return clone((s.certificateCatalog || []).filter(item => item.enable === '1'));
}

function normalizeCandidateRecord(s, candidate) {
  if (!candidate) return null;
  const item = { ...candidate };
  if (!item.certificateBindings?.length && item.certificates?.length) {
    item.certificateBindings = typeof item.certificates[0] === 'string' ? buildCertsFromNames(s, item.certificates) : item.certificates;
  }
  item.certificateBindings = (item.certificateBindings || []).map(line => {
    const validTo = line.validTo || '长期有效';
    return { ...line, status: calcCertStatus(validTo) };
  });
  item.certCount = item.certificateBindings.length;
  item.certExpiringCount = item.certificateBindings.filter(line => line.status === '即将过期').length;
  delete item.certificates;
  return item;
}

export function enrichTalentDetail(talent) {
  const s = loadStore();
  return normalizeTalentRecord(s, talent);
}

export function enrichCandidateDetail(candidate) {
  const s = loadStore();
  return normalizeCandidateRecord(s, candidate);
}

export function getCandidateStats() {
  const s = loadStore();
  const candidates = (s.candidates || []).map(c => normalizeCandidateRecord(s, c));
  return {
    total: candidates.length,
    new: candidates.filter(c => c.status === 'new').length,
    interview: candidates.filter(c => c.status === 'interview').length,
    offer: candidates.filter(c => c.status === 'offer').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
    resumeReady: candidates.filter(c => c.resumeGenerated).length,
    certHolders: candidates.filter(c => c.certCount > 0).length,
    certExpiring: candidates.reduce((sum, c) => sum + (c.certExpiringCount || 0), 0),
    pendingEmails: (s.recruitmentEmails || []).filter(e => !e.processed).length,
  };
}

function getTemplatesByType(s, type) {
  return (s.templates || []).filter(item => item.type === type && item.status === 'active');
}

function bumpTemplateUsage(s, templateId) {
  const tpl = findTemplate(s, templateId);
  if (tpl) tpl.usageCount = (tpl.usageCount || 0) + 1;
}

export function getTemplateOptions(type) {
  const s = loadStore();
  return getTemplatesByType(s, type).map(item => ({ label: item.name, value: item.id }));
}

export function addTemplate(row = {}) {
  const s = loadStore();
  const code = genCode('template');
  const id = `tpl-${row.type === 'bid' ? 'bid' : 'res'}-${pad(s.counters.template, 3)}`;
  const files = row.templateFiles || [];
  const file = files[0] || row.templateFile || null;
  const item = {
    id,
    code,
    name: row.name || '未命名模板',
    type: row.type || 'resume',
    description: row.description || '',
    fileName: file?.name || row.fileName || '',
    templateFile: file,
    status: row.status || 'active',
    usageCount: 0,
    createTime: now(),
  };
  s.templates.unshift(item);
  saveStore();
  return clone(item);
}

function findCandidate(s, id) {
  return s.candidates.find(item => item.id === id);
}

function findTalent(s, id) {
  return s.talents.find(item => item.id === id);
}

function findMember(s, memberId) {
  const candidate = findCandidate(s, memberId);
  if (candidate) return { type: 'candidate', record: candidate };
  const talent = findTalent(s, memberId);
  if (talent) return { type: 'talent', record: talent };
  return null;
}

function ensureTalentProfile(s, candidate) {
  if (!candidate || candidate.status !== 'hired') return;
  const normalized = normalizeCandidateRecord(s, candidate);
  const bindings = clone(normalized.certificateBindings || []);
  const exists = s.talents.find(item => item.id === candidate.id || item.name === candidate.name);
  if (exists) {
    if (exists.id !== candidate.id) {
      exists.id = candidate.id;
      exists.sourceCandidateId = candidate.id;
    }
    Object.assign(exists, {
      name: candidate.name,
      title: candidate.position,
      education: candidate.education || exists.education,
      phone: candidate.phone || exists.phone,
      email: candidate.email || exists.email,
      experienceYears: candidate.experienceYears,
      summary: candidate.summary || exists.summary,
      skills: [...(candidate.skills || [])],
      certificateBindings: bindings,
      projectCases: candidate.projectCases?.length ? [...candidate.projectCases] : exists.projectCases,
      resumeGenerated: candidate.resumeGenerated || exists.resumeGenerated,
    });
    return;
  }
  const code = genCode('talent');
  s.talents.unshift({
    id: candidate.id,
    sourceCandidateId: candidate.id,
    code,
    name: candidate.name,
    title: candidate.position,
    deptName: candidate.deptName || '待分配部门',
    education: candidate.education || '',
    phone: candidate.phone || '',
    email: candidate.email || '',
    experienceYears: candidate.experienceYears,
    summary: candidate.summary || '',
    skills: [...(candidate.skills || [])],
    certificateBindings: bindings,
    projectCases: candidate.projectCases?.length ? [...candidate.projectCases] : [],
    resumeHits: 0,
    resumeGenerated: candidate.resumeGenerated || false,
    createTime: now(),
  });
}

export function resetDemoData() {
  cache = createSeedData();
  saveStore();
  return cache;
}

export function getDemoData() {
  return clone(loadStore());
}

export function getStats() {
  const s = loadStore();
  return {
    emails: s.recruitmentEmails.length,
    candidates: s.candidates.length,
    interviews: s.candidates.filter(item => ['interview', 'offer', 'hired'].includes(item.status)).length,
    hired: s.talents.length,
    certHolders: s.talents.filter(item => (item.certificateBindings || item.certificates || []).length > 0).length,
    certExpiring: s.talents.reduce((sum, item) => {
      const lines = item.certificateBindings || [];
      return sum + lines.filter(line => calcCertStatus(line.validTo) === '即将过期').length;
    }, 0),
    resumes: s.resumes.length,
    bidPackages: s.bidPackages.length,
    templates: s.templates.length,
    resumeTemplates: s.templates.filter(item => item.type === 'resume').length,
    bidTemplates: s.templates.filter(item => item.type === 'bid').length,
    readyPackages: s.bidPackages.filter(item => calcPackageStatus(item) === 'ready').length,
  };
}

export function createCandidateFromEmail(emailId) {
  const s = loadStore();
  const mail = s.recruitmentEmails.find(item => item.id === emailId);
  if (!mail) return null;
  if (mail.processed && mail.candidateId) {
    return clone(findCandidate(s, mail.candidateId));
  }
  const existing = s.candidates.find(item => item.name === mail.candidateName && item.position === mail.position);
  if (existing) {
    mail.processed = true;
    mail.candidateId = existing.id;
    saveStore();
    return clone(existing);
  }
  const code = genCode('candidate');
  const id = `cand-${pad(s.counters.candidate, 3)}`;
  const candidate = {
    id,
    code,
    name: mail.candidateName,
    position: mail.position,
    source: mail.source,
    status: 'new',
    education: '本科',
    experienceYears: 3,
    phone: '',
    email: mail.sender,
    interviewScore: 0,
    skills: [],
    summary: '',
    certificateBindings: [],
    projectCases: [],
    resumeGenerated: false,
    lastTouch: '招聘邮箱登记入库，待 HR 初筛',
    history: [{ time: now(), action: '邮箱入库', detail: `来自邮件：${mail.subject}` }],
  };
  s.candidates.unshift(candidate);
  mail.processed = true;
  mail.candidateId = id;
  saveStore();
  return clone(candidate);
}

export function registerCandidate(form = {}) {
  const s = loadStore();
  const code = genCode('candidate');
  const id = `cand-${pad(s.counters.candidate, 3)}`;
  const candidate = {
    id,
    code,
    name: form.name || '未命名',
    position: form.position || '待定岗位',
    source: form.source || '手工登记',
    status: 'new',
    education: form.education || '本科',
    experienceYears: Number(form.experienceYears) || 0,
    phone: form.phone || '',
    email: form.email || '',
    interviewScore: 0,
    skills: Array.isArray(form.skills) ? [...form.skills] : [],
    summary: form.summary || '',
    certificateBindings: clone(form.certificateBindings || []),
    projectCases: Array.isArray(form.projectCases) ? [...form.projectCases] : [],
    resumeGenerated: false,
    lastTouch: '手工登记入库，待 HR 初筛',
    history: [{ time: now(), action: '手工登记', detail: 'HR 手工创建候选人记录' }],
  };
  s.candidates.unshift(candidate);
  saveStore();
  return clone(candidate);
}

export function rejectCandidate(candidateId, reason = '') {
  const s = loadStore();
  const candidate = findCandidate(s, candidateId);
  if (!candidate || candidate.status === 'hired') return null;
  candidate.status = 'rejected';
  candidate.rejectReason = reason || '不符合当前岗位需求';
  candidate.lastTouch = '已淘汰';
  candidate.history = candidate.history || [];
  candidate.history.unshift({
    time: now(),
    action: '已淘汰',
    detail: candidate.rejectReason,
  });
  saveStore();
  return clone(candidate);
}

export function promoteCandidate(candidateId) {
  const s = loadStore();
  const candidate = findCandidate(s, candidateId);
  if (!candidate) return null;
  const idx = candidateStatusFlow.indexOf(candidate.status);
  if (idx < 0 || idx >= candidateStatusFlow.length - 1) return clone(candidate);

  candidate.status = candidateStatusFlow[idx + 1];
  candidate.history = candidate.history || [];
  candidate.history.unshift({
    time: now(),
    action: candidate.status === 'interview' ? '安排面试' : candidate.status === 'offer' ? '发放录用函' : '确认录用',
    detail: `流程推进至 ${candidate.status}`,
  });
  candidate.lastTouch = candidate.status === 'hired' ? '已录用并同步人才档案' : candidate.lastTouch;
  if (candidate.status === 'hired') {
    candidate.hiredAt = now();
    ensureTalentProfile(s, candidate);
  }
  saveStore();
  return clone(candidate);
}

export function generateResume(memberId, templateId) {
  const s = loadStore();
  const member = findMember(s, memberId);
  if (!member) return null;

  let name = '';
  let matchRate = 85;
  let memberType = member.type;
  let canGenerate = false;

  if (member.type === 'candidate') {
    const candidate = member.record;
    if (!['offer', 'hired'].includes(candidate.status)) return null;
    name = candidate.name;
    matchRate = candidate.interviewScore || 85;
    canGenerate = true;
    candidate.resumeGenerated = true;
  } else {
    const talent = member.record;
    name = talent.name;
    matchRate = 90;
    canGenerate = true;
    talent.resumeGenerated = true;
    talent.resumeHits = (talent.resumeHits || 0) + 1;
    const linked = talent.sourceCandidateId ? findCandidate(s, talent.sourceCandidateId) : null;
    if (linked) linked.resumeGenerated = true;
  }

  if (!canGenerate) return null;

  const tpl = templateId ? findTemplate(s, templateId) : getTemplatesByType(s, 'resume')[0];
  if (templateId && !tpl) return null;

  const existing = s.resumes.find(item => item.memberId === memberId || item.candidateId === memberId);
  const resume = {
    id: existing?.id || genCode('resume'),
    memberId,
    candidateId: memberId,
    memberType,
    candidateName: name,
    templateId: tpl?.id || '',
    templateName: tpl?.name || '投标简历模板 A',
    fileName: `${name}_投标简历.pdf`,
    matchRate,
    generatedAt: now(),
  };
  if (existing) {
    Object.assign(existing, resume);
  } else {
    s.resumes.unshift(resume);
  }
  if (tpl?.id) bumpTemplateUsage(s, tpl.id);
  saveStore();
  return clone(resume);
}

export function addToBidPackage(memberId, packageId) {
  const s = loadStore();
  const member = findMember(s, memberId);
  if (!member) return null;
  if (member.type === 'candidate' && member.record.status === 'rejected') return null;

  const hasResume = member.type === 'candidate' ? member.record.resumeGenerated : member.record.resumeGenerated;
  if (!hasResume) {
    const generated = generateResume(memberId);
    if (!generated) return null;
  }

  let pkg = null;
  if (packageId) {
    pkg = s.bidPackages.find(item => item.id === packageId);
  }
  if (!pkg) {
    pkg = s.bidPackages.find(item => item.status !== 'ready') || s.bidPackages[0];
  }
  if (!pkg) return null;

  pkg.candidateIds = pkg.candidateIds || [];
  if (!pkg.candidateIds.includes(memberId)) pkg.candidateIds.push(memberId);
  pkg.status = calcPackageStatus(pkg);
  pkg.updatedAt = now();
  saveStore();
  return clone(pkg);
}

export function removeFromBidPackage(memberId, packageId) {
  const s = loadStore();
  const pkg = s.bidPackages.find(item => item.id === packageId);
  if (!pkg) return null;
  pkg.candidateIds = (pkg.candidateIds || []).filter(id => id !== memberId);
  if (pkg.status !== 'ready') {
    pkg.status = calcPackageStatus(pkg);
  }
  pkg.updatedAt = now();
  saveStore();
  return clone(pkg);
}

export function updateBidPackage(packageId, patch = {}) {
  const s = loadStore();
  const pkg = s.bidPackages.find(item => item.id === packageId);
  if (!pkg) return null;
  Object.assign(pkg, patch);
  if (!patch.status) {
    pkg.status = calcPackageStatus(pkg);
  }
  pkg.updatedAt = now();
  saveStore();
  return clone(pkg);
}

export function addBidPackage(row = {}) {
  const s = loadStore();
  const code = genCode('bidPackage');
  const id = `bid-${pad(s.counters.bidPackage, 3)}`;
  const tpl = row.templateId ? findTemplate(s, row.templateId) : getTemplatesByType(s, 'bid')[0];
  const pkg = {
    id,
    code,
    projectName: row.projectName || '新投标项目',
    customerName: row.customerName || '',
    templateId: tpl?.id || row.templateId || '',
    templateName: tpl?.name || row.templateName || '技术服务投标模板',
    candidateIds: [],
    requiredRoles: Number(row.requiredRoles) || 3,
    status: 'draft',
    updatedAt: now(),
  };
  s.bidPackages.unshift(pkg);
  if (tpl?.id) bumpTemplateUsage(s, tpl.id);
  saveStore();
  return clone(pkg);
}

function filterList(list, query = {}) {
  return list.filter(item => {
    return Object.keys(query).every(key => {
      const val = query[key];
      if (val === undefined || val === null || val === '') return true;
      const field = item[key];
      if (field === undefined || field === null) return false;
      if (key.endsWith('Id')) return String(field) === String(val);
      if (Array.isArray(field)) return field.join(',').toLowerCase().includes(String(val).toLowerCase());
      return String(field).toLowerCase().includes(String(val).toLowerCase());
    });
  });
}

function paginate(list, current = 1, size = 10) {
  const start = (current - 1) * size;
  return {
    records: list.slice(start, start + size),
    total: list.length,
    current,
    size,
  };
}

function mockResponse(data) {
  return Promise.resolve({ data: { code: 200, success: true, data } });
}

export function createCrudApi(collectionKey) {
  const getPage = (current, size, params = {}) => {
    const s = loadStore();
    let list = [...(s[collectionKey] || [])];
    const { status, source, memberType, resumeGenerated, memberId, type, ...filterParams } = params;
    if (status) list = list.filter(i => i.status === status);
    if (source) list = list.filter(i => i.source === source);
    if (type && collectionKey === 'templates') list = list.filter(i => i.type === type);
    if (memberType) list = list.filter(i => i.memberType === memberType);
    if (memberId) list = list.filter(i => i.memberId === memberId || i.candidateId === memberId);
    if (resumeGenerated === true || resumeGenerated === 'true') list = list.filter(i => i.resumeGenerated);
    if (resumeGenerated === false || resumeGenerated === 'false') list = list.filter(i => !i.resumeGenerated);
    list = filterList(list, filterParams);
    if (collectionKey === 'candidates') {
      list = list.map(item => normalizeCandidateRecord(s, item));
    }
    if (collectionKey === 'talents') {
      list = list.map(item => normalizeTalentRecord(s, item));
    }
    const sortKey = collectionKey === 'bidPackages' ? 'updatedAt' : 'createTime';
    list.sort((a, b) => (b[sortKey] || b.generatedAt || '').localeCompare(a[sortKey] || a.generatedAt || ''));
    return mockResponse(paginate(list, current, size));
  };

  return {
    getPage,
    getList: getPage,
    getDetail(id) {
      const s = loadStore();
      const item = (s[collectionKey] || []).find(i => i.id === id);
      if (collectionKey === 'talents') {
        return mockResponse(normalizeTalentRecord(s, item) || null);
      }
      if (collectionKey === 'candidates') {
        return mockResponse(normalizeCandidateRecord(s, item) || null);
      }
      return mockResponse(item || null);
    },
    update(row) {
      const s = loadStore();
      const list = s[collectionKey] || [];
      const idx = list.findIndex(i => i.id === row.id);
      if (idx < 0) return mockResponse(null);
      if (collectionKey === 'talents' && row.certificateBindings) {
        row.certificateBindings = row.certificateBindings.map(line => {
          const catalog = findCatalogCert(s, line.certificateId);
          const validTo = line.validTo || '长期有效';
          return {
            ...line,
            certName: line.certName || catalog?.certName || '',
            certType: line.certType || catalog?.certType || '20',
            status: calcCertStatus(validTo),
          };
        });
        row.certCount = row.certificateBindings.length;
      }
      if (collectionKey === 'candidates' && row.certificateBindings) {
        row.certificateBindings = row.certificateBindings.map(line => {
          const catalog = findCatalogCert(s, line.certificateId);
          const validTo = line.validTo || '长期有效';
          return {
            ...line,
            certName: line.certName || catalog?.certName || '',
            certType: line.certType || catalog?.certType || '20',
            status: calcCertStatus(validTo),
          };
        });
        row.certCount = row.certificateBindings.length;
      }
      list[idx] = { ...list[idx], ...row };
      if (collectionKey === 'bidPackages') {
        list[idx].status = calcPackageStatus(list[idx]);
        list[idx].updatedAt = now();
      }
      saveStore();
      return mockResponse(clone(list[idx]));
    },
    remove(id) {
      const s = loadStore();
      const list = s[collectionKey] || [];
      const idx = list.findIndex(i => i.id === id);
      if (idx < 0) return mockResponse(false);
      list.splice(idx, 1);
      saveStore();
      return mockResponse(true);
    },
  };
}
