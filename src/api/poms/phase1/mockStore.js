const STORAGE_KEY = 'poms-phase1-demo';

const pad = (n, len = 4) => String(n).padStart(len, '0');

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const today = () => new Date().toISOString().slice(0, 10);

const ym = () => {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}`;
};

const year = () => String(new Date().getFullYear());

function calcPaymentStatus(p) {
  if (Number(p.actualAmount) >= Number(p.planAmount) && Number(p.planAmount) > 0) return 'received';
  if (p.planDate && p.planDate < today() && !p.actualDate) return 'overdue';
  if (p.planDate && p.planDate <= today()) return 'pending';
  return 'not_due';
}

function createSeedData() {
  const c1Id = 'cus-001';
  const c2Id = 'cus-002';
  const c3Id = 'cus-003';
  const c4Id = 'cus-004';
  const opp1Id = 'opp-001';
  const opp2Id = 'opp-002';
  const opp3Id = 'opp-003';
  const opp4Id = 'opp-004';
  const opp5Id = 'opp-005';
  const tender1Id = 'tender-001';
  const tender2Id = 'tender-002';
  const tender3Id = 'tender-003';
  const tender4Id = 'tender-004';
  const tender5Id = 'tender-005';
  const win1Id = 'win-001';
  const win2Id = 'win-002';
  const contract1Id = 'contract-001';
  const contract2Id = 'contract-002';
  const contract3Id = 'contract-003';
  const contract4Id = 'contract-004';
  const contract5Id = 'contract-005';
  const contract6Id = 'contract-006';
  const contract7Id = 'contract-007';
  const project1Id = 'project-001';
  const project2Id = 'project-002';
  const project3Id = 'project-003';
  const project4Id = 'project-004';
  const project5Id = 'project-005';

  return {
    counters: {
      customer: 4,
      opportunity: 5,
      tender: 5,
      winbid: 2,
      contract: 7,
      project: 5,
      payment: 9,
    },
    customers: [
      {
        id: c1Id,
        code: 'CUS-0001',
        name: '中石油新疆油田公司',
        customerType: 'state',
        customerLevel: 'strategic',
        industry: 'oil',
        region: '新疆/克拉玛依',
        address: '克拉玛依市迎宾路',
        manager: 'u001',
        managerUserName: '张明',
        customerSource: 'active',
        status: 'normal',
        taxNo: '91650200MA77XXXX01',
        bankName: '工商银行克拉玛依分行',
        bankAccount: '6222021234567890',
        contacts: [
          { name: '李建国', title: '项目主管', phone: '0990-1234567', email: 'lijg@cnpc.com.cn', isPrimary: true },
          { name: '王芳', title: '采购经理', phone: '13800001111', email: 'wangf@cnpc.com.cn', isPrimary: false },
        ],
        createTime: '2026-01-15 10:00:00',
      },
      {
        id: c2Id,
        code: 'CUS-0002',
        name: '新疆能源集团',
        customerType: 'state',
        customerLevel: 'key',
        industry: 'energy',
        region: '新疆/乌鲁木齐',
        address: '乌鲁木齐市北京路',
        manager: 'u002',
        managerUserName: '李华',
        customerSource: 'referral',
        status: 'normal',
        taxNo: '91650100MA77XXXX02',
        bankName: '建设银行乌鲁木齐分行',
        bankAccount: '6227009876543210',
        contacts: [{ name: '赵强', title: '技术总监', phone: '13900002222', email: 'zhaoq@xjny.com', isPrimary: true }],
        createTime: '2026-02-20 14:30:00',
      },
      {
        id: c3Id,
        code: 'CUS-0003',
        name: '塔里木油田分公司',
        customerType: 'state',
        customerLevel: 'key',
        industry: 'oil',
        region: '新疆/库尔勒',
        address: '库尔勒市石化大道',
        manager: 'u003',
        managerUserName: '王磊',
        customerSource: 'tender_platform',
        status: 'paused',
        taxNo: '91652800MA77XXXX03',
        bankName: '农业银行库尔勒分行',
        bankAccount: '6228481234567890',
        contacts: [{ name: '刘洋', title: '采购主管', phone: '13700003333', email: 'liuy@tlmyt.com', isPrimary: true }],
        createTime: '2026-03-10 09:00:00',
      },
      {
        id: c4Id,
        code: 'CUS-0004',
        name: '华北油田技术服务公司',
        customerType: 'private',
        customerLevel: 'normal',
        industry: 'oil',
        region: '河北/任丘',
        address: '任丘市华北石油管理局',
        manager: 'u001',
        managerUserName: '张明',
        customerSource: 'active',
        status: 'lost',
        taxNo: '91130600MA77XXXX04',
        bankName: '中国银行任丘支行',
        bankAccount: '6216619876543210',
        contacts: [{ name: '陈静', title: '商务经理', phone: '13600004444', email: 'chenj@hbyt.com', isPrimary: true }],
        createTime: '2025-11-05 16:00:00',
      },
    ],
    opportunities: [
      {
        id: opp1Id,
        code: 'OPP-202606-0001',
        source: 'tender_platform',
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        projectName: '新疆油田地质建模技术服务',
        projectType: 'tech_service',
        expectedAmount: 2800000,
        expectedSignDate: '2026-08-30',
        stage: 'negotiation',
        followerId: 'u001',
        followerName: '张明',
        status: 'ongoing',
        tenderId: tender1Id,
        contractId: contract1Id,
        followRecords: [
          { time: '2026-05-10', method: 'visit', content: '初次拜访，了解项目需求', nextFollowDate: '2026-05-20' },
          { time: '2026-06-01', method: 'phone', content: '方案沟通，客户认可技术路线', nextFollowDate: '2026-06-15' },
        ],
        createTime: '2026-05-08 09:00:00',
      },
      {
        id: opp2Id,
        code: 'OPP-202606-0002',
        source: 'active',
        customerId: c2Id,
        customerName: '新疆能源集团',
        projectName: '储层评价咨询项目',
        projectType: 'consulting',
        expectedAmount: 1500000,
        expectedSignDate: '2026-09-15',
        stage: 'proposal',
        followerId: 'u002',
        followerName: '李华',
        status: 'ongoing',
        tenderId: tender2Id,
        contractId: '',
        followRecords: [{ time: '2026-06-05', method: 'online', content: '线上方案演示', nextFollowDate: '2026-06-20' }],
        createTime: '2026-06-01 11:00:00',
      },
      {
        id: opp3Id,
        code: 'OPP-202605-0003',
        source: 'partner',
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        projectName: '测井解释技术服务',
        projectType: 'tech_service',
        expectedAmount: 800000,
        expectedSignDate: '2026-06-30',
        stage: 'won',
        followerId: 'u001',
        followerName: '张明',
        status: 'won',
        tenderId: '',
        contractId: '',
        followRecords: [],
        createTime: '2026-05-01 08:00:00',
      },
      {
        id: opp4Id,
        code: 'OPP-202605-0004',
        source: 'active',
        customerId: c4Id,
        customerName: '华北油田技术服务公司',
        projectName: '老油田二次开发方案',
        projectType: 'consulting',
        expectedAmount: 1200000,
        expectedSignDate: '2026-05-30',
        stage: 'lost',
        followerId: 'u001',
        followerName: '张明',
        status: 'lost',
        lostReason: '客户预算削减，项目暂缓',
        tenderId: '',
        contractId: '',
        followRecords: [{ time: '2026-04-20', method: 'visit', content: '方案汇报后客户反馈预算不足', nextFollowDate: '' }],
        createTime: '2026-04-01 10:00:00',
      },
      {
        id: opp5Id,
        code: 'OPP-202606-0005',
        source: 'referral',
        customerId: c3Id,
        customerName: '塔里木油田分公司',
        projectName: '储层精细描述服务',
        projectType: 'tech_service',
        expectedAmount: 960000,
        expectedSignDate: '2026-10-01',
        stage: 'quote',
        followerId: 'u003',
        followerName: '王磊',
        status: 'suspended',
        tenderId: '',
        contractId: '',
        followRecords: [{ time: '2026-06-18', method: 'phone', content: '客户内部流程调整，暂缓跟进', nextFollowDate: '2026-08-01' }],
        createTime: '2026-06-12 14:00:00',
      },
    ],
    tenders: [
      {
        id: tender1Id,
        code: 'TENDER-202606-0001',
        opportunityId: opp1Id,
        opportunityName: '新疆油田地质建模技术服务',
        customerName: '中石油新疆油田公司',
        projectName: '新疆油田地质建模技术服务',
        tenderOrg: '中石油新疆油田公司',
        announcementNo: 'XJYT-2026-001',
        tenderMethod: 'public',
        bidAmount: 2750000,
        bidDate: '2026-06-20',
        openTime: '2026-06-25 10:00:00',
        bidBond: 50000,
        result: 'won',
        winAmount: 2680000,
        winDate: '2026-06-26',
        winNoticeNo: 'ZBTZ-2026-001',
        winbidId: win1Id,
        remark: '',
        bidFiles: [
          {
            id: 'bid-file-demo-001',
            name: '地质建模技术服务投标文件.pdf',
            size: 245760,
            type: 'application/pdf',
            dataUrl: '',
            uploadTime: '2026-06-18 16:30:00',
          },
        ],
        createTime: '2026-06-10 09:00:00',
      },
      {
        id: tender2Id,
        code: 'TENDER-202606-0002',
        opportunityId: opp2Id,
        opportunityName: '储层评价咨询项目',
        customerName: '新疆能源集团',
        projectName: '储层评价咨询项目',
        tenderOrg: '新疆能源集团',
        announcementNo: 'XJNY-2026-008',
        tenderMethod: 'invite',
        bidAmount: 1480000,
        bidDate: '2026-07-10',
        openTime: '2026-07-15 14:00:00',
        bidBond: 30000,
        result: 'pending',
        winAmount: null,
        winDate: null,
        winNoticeNo: '',
        remark: '',
        bidFiles: [],
        createTime: '2026-06-15 10:00:00',
      },
      {
        id: tender3Id,
        code: 'TENDER-202606-0003',
        opportunityId: opp4Id,
        opportunityName: '老油田二次开发方案',
        customerName: '华北油田技术服务公司',
        projectName: '老油田二次开发方案',
        tenderOrg: '华北油田技术服务公司',
        announcementNo: 'HBYT-2026-003',
        tenderMethod: 'negotiate',
        bidAmount: 1180000,
        bidDate: '2026-05-15',
        openTime: '2026-05-20 09:30:00',
        bidBond: 20000,
        result: 'lost',
        winAmount: null,
        winDate: null,
        winNoticeNo: '',
        remark: '综合评分落后，未中标',
        bidFiles: [],
        createTime: '2026-05-01 11:00:00',
      },
      {
        id: tender4Id,
        code: 'TENDER-202606-0004',
        opportunityId: opp5Id,
        opportunityName: '储层精细描述服务',
        customerName: '塔里木油田分公司',
        projectName: '储层精细描述服务',
        tenderOrg: '塔里木油田分公司',
        announcementNo: 'TLM-2026-012',
        tenderMethod: 'public',
        bidAmount: 950000,
        bidDate: '2026-06-25',
        openTime: '2026-06-28 10:00:00',
        bidBond: 25000,
        result: 'abort',
        winAmount: null,
        winDate: null,
        winNoticeNo: '',
        remark: '有效投标人不足三家，流标',
        bidFiles: [],
        createTime: '2026-06-10 08:30:00',
      },
      {
        id: tender5Id,
        code: 'TENDER-202606-0005',
        opportunityId: opp2Id,
        opportunityName: '储层评价咨询项目',
        customerName: '新疆能源集团',
        projectName: '储层评价咨询项目',
        tenderOrg: '新疆能源集团',
        announcementNo: 'XJNY-2026-015',
        tenderMethod: 'invite',
        bidAmount: 1450000,
        bidDate: '2026-06-18',
        openTime: '2026-06-22 14:00:00',
        bidBond: 35000,
        result: 'won',
        winAmount: 1420000,
        winDate: '2026-06-23',
        winNoticeNo: 'ZBTZ-2026-008',
        winbidId: win2Id,
        remark: '',
        bidFiles: [],
        createTime: '2026-06-08 09:00:00',
      },
    ],
    winbids: [
      {
        id: win1Id,
        code: 'WIN-202606-0001',
        tenderId: tender1Id,
        tenderCode: 'TENDER-202606-0001',
        projectName: '新疆油田地质建模技术服务',
        customerName: '中石油新疆油田公司',
        noticeNo: 'ZBTZ-2026-001',
        winAmount: 2680000,
        winDate: '2026-06-26',
        servicePeriod: '12个月',
        performanceBond: 134000,
        serviceFee: 26800,
        contractStatus: 'generated',
        contractId: contract1Id,
        contractCode: 'HT-2026-0001',
        noticeFiles: [],
        createTime: '2026-06-26 15:00:00',
      },
      {
        id: win2Id,
        code: 'WIN-202606-0002',
        tenderId: tender5Id,
        tenderCode: 'TENDER-202606-0005',
        projectName: '储层评价咨询项目',
        customerName: '新疆能源集团',
        noticeNo: 'ZBTZ-2026-008',
        winAmount: 1420000,
        winDate: '2026-06-23',
        servicePeriod: '8个月',
        performanceBond: 71000,
        serviceFee: 14200,
        contractStatus: 'pending',
        contractId: '',
        contractCode: '',
        noticeFiles: [],
        createTime: '2026-06-23 16:00:00',
      },
    ],
    contracts: [
      {
        id: contract1Id,
        code: 'HT-2026-0001',
        winbidId: win1Id,
        winbidCode: 'WIN-202606-0001',
        opportunityId: opp1Id,
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        projectName: '新疆油田地质建模技术服务',
        contractType: 'tech_service',
        serviceContent: '提供地质建模、储层参数解释及成果报告编制等全流程技术服务。',
        serviceStartDate: '2026-07-01',
        serviceEndDate: '2027-06-30',
        contractAmount: 2680000,
        signDate: '2026-06-28',
        contractStatus: 'signed',
        paymentPlans: [
          { node: 'prepay', ratio: 30, amount: 804000, planDate: '2026-07-15' },
          { node: 'progress', ratio: 40, amount: 1072000, planDate: '2026-12-31' },
          { node: 'acceptance', ratio: 25, amount: 670000, planDate: '2027-06-30' },
          { node: 'warranty', ratio: 5, amount: 134000, planDate: '2027-12-31' },
        ],
        projectId: project1Id,
        contractFiles: [],
        createTime: '2026-06-27 10:00:00',
      },
      {
        id: contract2Id,
        code: 'HT-2026-0002',
        winbidId: '',
        winbidCode: '',
        opportunityId: opp1Id,
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        projectName: '新疆油田地质建模技术服务',
        contractType: 'tech_service',
        serviceContent: '地质建模项目补充技术服务及现场支持。',
        serviceStartDate: '2026-08-01',
        serviceEndDate: '2026-12-31',
        contractAmount: 520000,
        signDate: '2026-06-29',
        contractStatus: 'signed',
        paymentPlans: [
          { node: 'prepay', ratio: 50, amount: 260000, planDate: '2026-08-15' },
          { node: 'acceptance', ratio: 50, amount: 260000, planDate: '2026-12-31' },
        ],
        projectId: project1Id,
        contractFiles: [],
        createTime: '2026-06-29 09:00:00',
      },
      {
        id: contract3Id,
        code: 'HT-2026-0003',
        winbidId: win2Id,
        winbidCode: 'WIN-202606-0002',
        opportunityId: opp2Id,
        customerId: c2Id,
        customerName: '新疆能源集团',
        projectName: '储层评价咨询项目',
        contractType: 'consulting',
        serviceContent: '储层评价与开发方案咨询，含成果报告。',
        serviceStartDate: '2026-09-01',
        serviceEndDate: '2027-04-30',
        contractAmount: 1420000,
        signDate: '',
        contractStatus: 'draft',
        paymentPlans: [
          { node: 'prepay', ratio: 40, amount: 568000, planDate: '' },
          { node: 'progress', ratio: 40, amount: 568000, planDate: '' },
          { node: 'acceptance', ratio: 20, amount: 284000, planDate: '' },
        ],
        projectId: '',
        contractFiles: [],
        createTime: '2026-06-24 10:00:00',
      },
      {
        id: contract4Id,
        code: 'HT-2026-0004',
        winbidId: '',
        winbidCode: '',
        opportunityId: opp5Id,
        customerId: c3Id,
        customerName: '塔里木油田分公司',
        projectName: '储层精细描述服务',
        contractType: 'tech_service',
        serviceContent: '储层精细描述及参数建模。',
        serviceStartDate: '2026-10-01',
        serviceEndDate: '2027-03-31',
        contractAmount: 960000,
        signDate: '',
        contractStatus: 'approving',
        paymentPlans: [
          { node: 'prepay', ratio: 30, amount: 288000, planDate: '2026-10-15' },
          { node: 'acceptance', ratio: 70, amount: 672000, planDate: '2027-03-31' },
        ],
        projectId: '',
        contractFiles: [],
        createTime: '2026-06-20 11:00:00',
      },
      {
        id: contract5Id,
        code: 'HT-2025-0088',
        winbidId: '',
        winbidCode: '',
        opportunityId: '',
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        projectName: '油田数字化平台运维',
        contractType: 'tech_service',
        serviceContent: '平台日常运维与技术支持。',
        serviceStartDate: '2025-01-01',
        serviceEndDate: '2026-12-31',
        contractAmount: 1800000,
        signDate: '2024-12-20',
        contractStatus: 'executing',
        paymentPlans: [
          { node: 'prepay', ratio: 50, amount: 900000, planDate: '2025-01-15' },
          { node: 'progress', ratio: 50, amount: 900000, planDate: '2025-12-31' },
        ],
        projectId: project2Id,
        contractFiles: [],
        createTime: '2024-12-18 09:00:00',
      },
      {
        id: contract6Id,
        code: 'HT-2024-0066',
        winbidId: '',
        winbidCode: '',
        opportunityId: '',
        customerId: c2Id,
        customerName: '新疆能源集团',
        projectName: '区块储量评估项目',
        contractType: 'consulting',
        serviceContent: '储量评估报告编制及评审支持。',
        serviceStartDate: '2024-06-01',
        serviceEndDate: '2025-05-31',
        contractAmount: 880000,
        signDate: '2024-05-28',
        contractStatus: 'completed',
        paymentPlans: [
          { node: 'prepay', ratio: 100, amount: 880000, planDate: '2024-06-15' },
        ],
        projectId: project4Id,
        contractFiles: [],
        createTime: '2024-05-25 14:00:00',
      },
      {
        id: contract7Id,
        code: 'HT-2023-0033',
        winbidId: '',
        winbidCode: '',
        opportunityId: '',
        customerId: c4Id,
        customerName: '华北油田技术服务公司',
        projectName: '钻井液性能评价',
        contractType: 'survey',
        serviceContent: '钻井液取样与性能评价（已终止）。',
        serviceStartDate: '2023-03-01',
        serviceEndDate: '2023-08-31',
        contractAmount: 420000,
        signDate: '2023-02-25',
        contractStatus: 'terminated',
        paymentPlans: [
          { node: 'prepay', ratio: 100, amount: 420000, planDate: '2023-03-15' },
        ],
        projectId: project5Id,
        contractFiles: [],
        createTime: '2023-02-20 10:00:00',
      },
    ],
    projects: [
      {
        id: project1Id,
        code: 'PRJ-2026-0001',
        projectName: '新疆油田地质建模技术服务',
        contractId: contract1Id,
        contractCode: 'HT-2026-0001',
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        cooperationType: 'self',
        partnerCompany: '',
        serviceType: 'tech_service',
        projectManagerId: 'u001',
        projectManagerName: '张明',
        budget: 2680000,
        planStartDate: '2026-07-01',
        planEndDate: '2027-06-30',
        status: 'pending_proposal',
        description: '基于合同立项的项目，待开题报告。',
        createTime: '2026-06-28 14:00:00',
      },
      {
        id: project2Id,
        code: 'PRJ-2025-0088',
        projectName: '油田数字化平台运维',
        contractId: contract5Id,
        contractCode: 'HT-2025-0088',
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        cooperationType: 'self',
        partnerCompany: '',
        serviceType: 'tech_service',
        projectManagerId: 'u002',
        projectManagerName: '李华',
        budget: 1800000,
        planStartDate: '2025-01-01',
        planEndDate: '2026-12-31',
        status: 'ongoing',
        description: '执行中的运维服务项目。',
        createTime: '2024-12-22 10:00:00',
      },
      {
        id: project3Id,
        code: 'PRJ-2025-0042',
        projectName: '致密油藏开发评价',
        contractId: contract1Id,
        contractCode: 'HT-2026-0001',
        customerId: c1Id,
        customerName: '中石油新疆油田公司',
        cooperationType: 'joint',
        partnerCompany: '新疆地质研究院',
        serviceType: 'tech_service',
        projectManagerId: 'u001',
        projectManagerName: '张明',
        budget: 1200000,
        planStartDate: '2025-06-01',
        planEndDate: '2026-05-31',
        status: 'pending_acceptance',
        description: '成果已提交，待客户验收。',
        createTime: '2025-05-28 09:00:00',
      },
      {
        id: project4Id,
        code: 'PRJ-2024-0066',
        projectName: '区块储量评估项目',
        contractId: contract6Id,
        contractCode: 'HT-2024-0066',
        customerId: c2Id,
        customerName: '新疆能源集团',
        cooperationType: 'self',
        partnerCompany: '',
        serviceType: 'consulting',
        projectManagerId: 'u002',
        projectManagerName: '李华',
        budget: 880000,
        planStartDate: '2024-06-01',
        planEndDate: '2025-05-31',
        status: 'completed',
        description: '项目已验收完成。',
        createTime: '2024-05-30 11:00:00',
      },
      {
        id: project5Id,
        code: 'PRJ-2023-0033',
        projectName: '钻井液性能评价',
        contractId: contract7Id,
        contractCode: 'HT-2023-0033',
        customerId: c4Id,
        customerName: '华北油田技术服务公司',
        cooperationType: 'self',
        partnerCompany: '',
        serviceType: 'survey',
        projectManagerId: 'u001',
        projectManagerName: '张明',
        budget: 420000,
        planStartDate: '2023-03-01',
        planEndDate: '2023-08-31',
        status: 'terminated',
        description: '因客户原因提前终止。',
        createTime: '2023-02-28 15:00:00',
      },
    ],
    payments: [
      {
        id: 'pay-001',
        contractId: contract1Id,
        contractCode: 'HT-2026-0001',
        customerName: '中石油新疆油田公司',
        planNode: 'prepay',
        planRatio: 30,
        planAmount: 804000,
        planDate: '2026-07-15',
        actualDate: '2026-07-10',
        actualAmount: 804000,
        paymentMethod: 'bank_transfer',
        invoiceStatus: 'invoiced',
        status: 'received',
        createTime: '2026-06-28 10:00:00',
      },
      {
        id: 'pay-002',
        contractId: contract1Id,
        contractCode: 'HT-2026-0001',
        customerName: '中石油新疆油田公司',
        planNode: 'progress',
        planRatio: 40,
        planAmount: 1072000,
        planDate: '2026-12-31',
        actualDate: '',
        actualAmount: 0,
        paymentMethod: '',
        invoiceStatus: 'not_invoiced',
        status: 'pending',
        createTime: '2026-06-28 10:00:00',
      },
      {
        id: 'pay-003',
        contractId: contract1Id,
        contractCode: 'HT-2026-0001',
        customerName: '中石油新疆油田公司',
        planNode: 'acceptance',
        planRatio: 25,
        planAmount: 670000,
        planDate: '2027-06-30',
        actualDate: '',
        actualAmount: 0,
        paymentMethod: '',
        invoiceStatus: 'not_invoiced',
        status: 'not_due',
        createTime: '2026-06-28 10:00:00',
      },
      {
        id: 'pay-004',
        contractId: contract2Id,
        contractCode: 'HT-2026-0002',
        customerName: '中石油新疆油田公司',
        planNode: 'prepay',
        planRatio: 50,
        planAmount: 260000,
        planDate: '2026-06-01',
        actualDate: '',
        actualAmount: 0,
        paymentMethod: '',
        invoiceStatus: 'not_invoiced',
        status: 'overdue',
        createTime: '2026-06-29 09:00:00',
      },
      {
        id: 'pay-005',
        contractId: contract2Id,
        contractCode: 'HT-2026-0002',
        customerName: '中石油新疆油田公司',
        planNode: 'acceptance',
        planRatio: 50,
        planAmount: 260000,
        planDate: '2026-12-31',
        actualDate: '',
        actualAmount: 0,
        paymentMethod: '',
        invoiceStatus: 'not_invoiced',
        status: 'not_due',
        createTime: '2026-06-29 09:00:00',
      },
      {
        id: 'pay-006',
        contractId: contract5Id,
        contractCode: 'HT-2025-0088',
        customerName: '中石油新疆油田公司',
        planNode: 'progress',
        planRatio: 50,
        planAmount: 900000,
        planDate: '2025-12-31',
        actualDate: '2025-12-28',
        actualAmount: 900000,
        paymentMethod: 'bank_transfer',
        invoiceStatus: 'invoiced',
        status: 'received',
        createTime: '2025-01-10 10:00:00',
      },
      {
        id: 'pay-007',
        contractId: contract5Id,
        contractCode: 'HT-2025-0088',
        customerName: '中石油新疆油田公司',
        planNode: 'prepay',
        planRatio: 50,
        planAmount: 900000,
        planDate: '2025-01-15',
        actualDate: '',
        actualAmount: 450000,
        paymentMethod: 'bank_transfer',
        invoiceStatus: 'invoiced',
        status: 'pending',
        createTime: '2025-01-10 10:00:00',
      },
      {
        id: 'pay-008',
        contractId: contract6Id,
        contractCode: 'HT-2024-0066',
        customerName: '新疆能源集团',
        planNode: 'prepay',
        planRatio: 100,
        planAmount: 880000,
        planDate: '2024-06-15',
        actualDate: '2024-06-12',
        actualAmount: 880000,
        paymentMethod: 'bank_transfer',
        invoiceStatus: 'invoiced',
        status: 'received',
        createTime: '2024-05-30 10:00:00',
      },
      {
        id: 'pay-009',
        contractId: contract7Id,
        contractCode: 'HT-2023-0033',
        customerName: '华北油田技术服务公司',
        planNode: 'prepay',
        planRatio: 100,
        planAmount: 420000,
        planDate: '2023-03-15',
        actualDate: '2023-03-10',
        actualAmount: 200000,
        paymentMethod: 'bank_transfer',
        invoiceStatus: 'invoiced',
        status: 'received',
        createTime: '2023-02-28 10:00:00',
      },
    ],
  };
}

let cache = null;

function loadStore() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache;
    }
  } catch (e) {
    console.warn('演示数据加载失败', e);
  }
  cache = createSeedData();
  saveStore();
  return cache;
}

function saveStore() {
  if (cache) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
}

export function resetDemoData() {
  cache = createSeedData();
  saveStore();
  return cache;
}

export function getStats() {
  const s = loadStore();
  return {
    customers: s.customers.length,
    opportunities: s.opportunities.length,
    tenders: s.tenders.length,
    winbids: s.winbids.length,
    contracts: s.contracts.length,
    projects: s.projects.length,
    payments: s.payments.length,
  };
}

function genCode(type) {
  const s = loadStore();
  s.counters[type] = (s.counters[type] || 0) + 1;
  const n = s.counters[type];
  switch (type) {
    case 'customer':
      return `CUS-${pad(n)}`;
    case 'opportunity':
      return `OPP-${ym()}-${pad(n)}`;
    case 'tender':
      return `TENDER-${ym()}-${pad(n)}`;
    case 'winbid':
      return `WIN-${ym()}-${pad(n)}`;
    case 'contract':
      return `HT-${year()}-${pad(n)}`;
    case 'project':
      return `PRJ-${year()}-${pad(n)}`;
    default:
      return `ID-${n}`;
  }
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function filterList(list, query = {}) {
  return list.filter(item => {
    return Object.keys(query).every(key => {
      const val = query[key];
      if (val === undefined || val === null || val === '') return true;
      const field = item[key];
      if (field === undefined || field === null) return false;
      if (key.endsWith('Id')) return String(field) === String(val);
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

export function syncTenderWinInfo(winbid) {
  if (!winbid?.tenderId) return;
  const s = loadStore();
  const tender = s.tenders.find(t => t.id === winbid.tenderId);
  if (!tender) return;
  tender.winAmount = winbid.winAmount ?? null;
  tender.winDate = winbid.winDate || null;
  tender.winNoticeNo = winbid.noticeNo || '';
  tender.winbidId = winbid.id;
  saveStore();
}

export function createCrudApi(collectionKey) {
  const getPage = (current, size, params = {}) => {
    const s = loadStore();
    let list = [...(s[collectionKey] || [])];
    const { projectId, contractId, status, signGroup, ...filterParams } = params;
    if (params.result) {
      list = list.filter(i => i.result === params.result);
    }
    if (params.contractStatus) {
      list = list.filter(i => i.contractStatus === params.contractStatus);
    }
    if (signGroup === 'unsigned' && collectionKey === 'contracts') {
      list = list.filter(i => ['draft', 'approving', 'terminated'].includes(i.contractStatus));
    }
    if (signGroup === 'signed' && collectionKey === 'contracts') {
      list = list.filter(i => ['signed', 'executing', 'completed'].includes(i.contractStatus));
    }
    if (status && collectionKey === 'payments') {
      list = list.filter(i => calcPaymentStatus(i) === status);
    } else if (status) {
      list = list.filter(i => i.status === status);
    }
    if (projectId && collectionKey === 'payments') {
      const ids = new Set(s.contracts.filter(c => c.projectId === projectId).map(c => c.id));
      list = ids.size ? list.filter(i => ids.has(i.contractId)) : [];
    }
    if (contractId && collectionKey === 'payments') {
      list = list.filter(i => i.contractId === contractId);
    }
    if (projectId && collectionKey === 'contracts') {
      if (projectId === '__unassigned__') {
        list = list.filter(i => !i.projectId);
      } else {
        list = list.filter(i => i.projectId === projectId);
      }
    }
    if (contractId && collectionKey === 'contracts') {
      list = list.filter(i => i.id === contractId);
    }
    list = filterList(list, filterParams);
    list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
    return mockResponse(paginate(list, current, size));
  };

  return {
    getPage,
    getList: getPage,
    getDetail(id) {
      const s = loadStore();
      const item = (s[collectionKey] || []).find(i => i.id === id);
      return mockResponse(item || null);
    },
    add(row) {
      const s = loadStore();
      const typeMap = {
        customers: 'customer',
        opportunities: 'opportunity',
        tenders: 'tender',
        winbids: 'winbid',
        contracts: 'contract',
        projects: 'project',
        payments: 'payment',
      };
      const codeType = typeMap[collectionKey];
      const item = {
        ...row,
        id: row.id || genId(collectionKey.slice(0, 3)),
        code: row.code || (codeType ? genCode(codeType) : genId('code')),
        createTime: row.createTime || now(),
      };
      s[collectionKey].unshift(item);
      saveStore();
      return mockResponse(item);
    },
    update(row) {
      const s = loadStore();
      const idx = s[collectionKey].findIndex(i => i.id === row.id);
      if (idx >= 0) {
        s[collectionKey][idx] = { ...s[collectionKey][idx], ...row };
        saveStore();
        return mockResponse(s[collectionKey][idx]);
      }
      return mockResponse(null);
    },
    remove(ids) {
      const s = loadStore();
      const idArr = String(ids).split(',');
      s[collectionKey] = s[collectionKey].filter(i => !idArr.includes(i.id));
      saveStore();
      return mockResponse(true);
    },
  };
}

export function syncContractPayments(contract) {
  const s = loadStore();
  s.payments = s.payments.filter(p => p.contractId !== contract.id);
  (contract.paymentPlans || []).forEach((plan, idx) => {
    const planDate = plan.planDate || '';
    let status = 'not_due';
    if (planDate && planDate < today()) status = 'overdue';
    s.payments.push({
      id: genId('pay'),
      contractId: contract.id,
      contractCode: contract.code,
      customerName: contract.customerName,
      planNode: plan.node,
      planRatio: plan.ratio,
      planAmount: plan.amount,
      planDate,
      actualDate: '',
      actualAmount: 0,
      paymentMethod: '',
      invoiceStatus: 'not_invoiced',
      status,
      createTime: now(),
    });
  });
  saveStore();
}

export function createContractFromWinbid(winbidId) {
  const s = loadStore();
  const win = s.winbids.find(w => w.id === winbidId);
  if (!win) return mockResponse(null);
  const tender = s.tenders.find(t => t.id === win.tenderId);
  const opp = tender ? s.opportunities.find(o => o.id === tender.opportunityId) : null;
  const existing = s.contracts.find(c => c.winbidId === winbidId);
  if (existing) return mockResponse(existing);

  const contract = {
    id: genId('contract'),
    code: genCode('contract'),
    winbidId: win.id,
    winbidCode: win.code,
    opportunityId: opp?.id || '',
    customerId: opp?.customerId || '',
    customerName: win.customerName,
    projectName: win.projectName,
    contractType: 'tech_service',
    serviceContent: '',
    serviceStartDate: '',
    serviceEndDate: '',
    contractAmount: win.winAmount,
    signDate: '',
    contractStatus: 'draft',
    paymentPlans: [
      { node: 'prepay', ratio: 30, amount: Math.round(win.winAmount * 0.3), planDate: '' },
      { node: 'progress', ratio: 40, amount: Math.round(win.winAmount * 0.4), planDate: '' },
      { node: 'acceptance', ratio: 25, amount: Math.round(win.winAmount * 0.25), planDate: '' },
      { node: 'warranty', ratio: 5, amount: Math.round(win.winAmount * 0.05), planDate: '' },
    ],
    projectId: '',
    createTime: now(),
  };
  s.contracts.unshift(contract);
  win.contractStatus = 'generated';
  win.contractId = contract.id;
  win.contractCode = contract.code;
  if (opp) {
    opp.contractId = contract.id;
  }
  saveStore();
  return mockResponse(contract);
}

export function createProjectFromContract(contractId, formData) {
  const s = loadStore();
  const contract = s.contracts.find(c => c.id === contractId);
  if (!contract) return mockResponse(null);
  if (contract.projectId) {
    const existing = s.projects.find(p => p.id === contract.projectId);
    return mockResponse(existing);
  }
  const project = {
    id: genId('project'),
    code: genCode('project'),
    projectName: formData.projectName || contract.projectName,
    contractId: contract.id,
    contractCode: contract.code,
    customerId: contract.customerId,
    customerName: contract.customerName,
    cooperationType: formData.cooperationType || 'self',
    partnerCompany: formData.partnerCompany || '',
    serviceType: formData.serviceType || contract.contractType,
    projectManagerId: formData.projectManagerId || 'u001',
    projectManagerName: formData.projectManagerName || '张明',
    budget: formData.budget || contract.contractAmount,
    planStartDate: formData.planStartDate || contract.serviceStartDate,
    planEndDate: formData.planEndDate || contract.serviceEndDate,
    status: 'pending_proposal',
    description: formData.description || '',
    createTime: now(),
  };
  s.projects.unshift(project);
  contract.projectId = project.id;
  saveStore();
  return mockResponse(project);
}

function resolvePaymentScope(s, { contractId, projectId } = {}) {
  let contracts = s.contracts;
  if (contractId) {
    contracts = contracts.filter(c => c.id === contractId);
  } else if (projectId) {
    contracts = contracts.filter(c => c.projectId === projectId);
  }
  const contractIds = new Set(contracts.map(c => c.id));
  const payments = s.payments.filter(p => contractIds.has(p.contractId));
  return { contracts, payments };
}

export function getPaymentStatistics(scope = {}) {
  const normalized = typeof scope === 'string' ? { contractId: scope } : scope || {};
  const s = loadStore();
  const { contracts, payments } = resolvePaymentScope(s, normalized);
  const contractAmount = contracts.reduce((sum, c) => sum + (Number(c.contractAmount) || 0), 0);
  const contractReceived = payments.reduce((sum, p) => sum + (Number(p.actualAmount) || 0), 0);
  const contractPending = contractAmount - contractReceived;
  const contractExpected = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + (Number(p.planAmount) - Number(p.actualAmount || 0)), 0);
  return {
    contractTotal: contracts.length,
    contractAmount,
    contractReceived,
    contractPending: Math.max(0, contractPending),
    contractExpected,
    contractReceiptRate: contractAmount ? Math.round((contractReceived / contractAmount) * 100) : 0,
  };
}

export function getPaymentProjectTree() {
  const s = loadStore();
  const projectMap = new Map();
  s.projects.forEach(p => {
    projectMap.set(p.id, {
      id: p.id,
      code: p.code,
      projectName: p.projectName,
      customerName: p.customerName,
      budget: p.budget,
      contracts: [],
    });
  });

  const unassigned = {
    id: '__unassigned__',
    code: '-',
    projectName: '未关联项目',
    customerName: '',
    contracts: [],
  };

  s.contracts.forEach(c => {
    const cPayments = s.payments.filter(p => p.contractId === c.id);
    const received = cPayments.reduce((sum, p) => sum + (Number(p.actualAmount) || 0), 0);
    const contractNode = {
      id: c.id,
      code: c.code,
      projectName: c.projectName,
      customerName: c.customerName,
      contractAmount: Number(c.contractAmount) || 0,
      contractStatus: c.contractStatus,
      paymentCount: cPayments.length,
      received,
    };
    if (c.projectId && projectMap.has(c.projectId)) {
      projectMap.get(c.projectId).contracts.push(contractNode);
    } else {
      unassigned.contracts.push(contractNode);
    }
  });

  const tree = [...projectMap.values()];
  if (unassigned.contracts.length) tree.push(unassigned);
  return tree;
}

export function getCustomerHistory(customerId) {
  const s = loadStore();
  return {
    projects: s.projects.filter(p => p.customerId === customerId),
    contracts: s.contracts.filter(c => c.customerId === customerId),
    payments: s.payments.filter(p => {
      const c = s.contracts.find(ct => ct.id === p.contractId);
      return c?.customerId === customerId;
    }),
  };
}

export { loadStore, saveStore, today, now, calcPaymentStatus };

function calcContractPaymentStatus(nodes) {
  const statuses = nodes.map(n => calcPaymentStatus(n));
  if (statuses.length && statuses.every(s => s === 'received')) return 'received';
  if (statuses.some(s => s === 'overdue')) return 'overdue';
  if (statuses.some(s => s === 'pending')) return 'pending';
  return 'not_due';
}

function buildContractPaymentRow(contract, payments) {
  const nodes = payments
    .map(p => ({ ...p, status: calcPaymentStatus(p) }))
    .sort((a, b) => (a.createTime || '').localeCompare(b.createTime || ''));
  const planTotal = nodes.reduce((sum, p) => sum + (Number(p.planAmount) || 0), 0);
  const receivedTotal = nodes.reduce((sum, p) => sum + (Number(p.actualAmount) || 0), 0);
  const contractId = contract?.id || nodes[0]?.contractId;
  return {
    id: contractId,
    contractId,
    contractCode: contract?.code || nodes[0]?.contractCode || '',
    customerName: contract?.customerName || nodes[0]?.customerName || '',
    projectName: contract?.projectName || '',
    contractAmount: Number(contract?.contractAmount) || planTotal,
    planTotal,
    receivedTotal,
    pendingTotal: Math.max(0, planTotal - receivedTotal),
    nodeCount: nodes.length,
    receivedNodeCount: nodes.filter(n => n.status === 'received').length,
    status: calcContractPaymentStatus(nodes),
    nodes,
    createTime: nodes.reduce((max, p) => ((p.createTime || '') > max ? p.createTime : max), ''),
  };
}

function filterContractPayments(s, params = {}) {
  const { projectId, contractId, status, ...filterParams } = params;
  let payments = [...s.payments];
  if (projectId) {
    const ids = new Set(s.contracts.filter(c => c.projectId === projectId).map(c => c.id));
    payments = ids.size ? payments.filter(p => ids.has(p.contractId)) : [];
  }
  if (contractId) {
    payments = payments.filter(p => p.contractId === contractId);
  }
  const map = new Map();
  payments.forEach(p => {
    if (!map.has(p.contractId)) map.set(p.contractId, []);
    map.get(p.contractId).push(p);
  });
  let list = [...map.entries()].map(([cid, cPayments]) => {
    const contract = s.contracts.find(c => c.id === cid);
    return buildContractPaymentRow(contract, cPayments);
  });
  list = filterList(list, filterParams);
  if (status) {
    list = list.filter(item => item.status === status);
  }
  list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  return list;
}

export function getContractPaymentPage(current = 1, size = 10, params = {}) {
  const s = loadStore();
  const list = filterContractPayments(s, params);
  return mockResponse(paginate(list, current, size));
}

export function getContractPaymentDetail(contractId) {
  const s = loadStore();
  const contract = s.contracts.find(c => c.id === contractId);
  const payments = s.payments.filter(p => p.contractId === contractId);
  if (!payments.length && !contract) return mockResponse(null);
  return mockResponse(buildContractPaymentRow(contract, payments));
}

export function updatePaymentNode(id, row) {
  const s = loadStore();
  const idx = s.payments.findIndex(p => p.id === id);
  if (idx < 0) return mockResponse(null);
  const item = {
    ...s.payments[idx],
    ...row,
    status: calcPaymentStatus({ ...s.payments[idx], ...row }),
  };
  s.payments[idx] = item;
  saveStore();
  return mockResponse(item);
}
