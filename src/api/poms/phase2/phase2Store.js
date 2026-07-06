/**
 * Phase2 项目主线 Mock 数据层（扩展 Phase1 共用 localStorage）
 */
import { loadStore, saveStore, now, today, syncProjectContracts } from '../phase1/mockStore';

const pad = (n, len = 3) => String(n).padStart(len, '0');

function mockResponse(data) {
  return Promise.resolve({ data: { code: 200, success: true, data } });
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function genCode(type) {
  const s = ensurePhase2();
  s.counters[type] = (s.counters[type] || 0) + 1;
  const n = s.counters[type];
  const d = new Date();
  const ym = `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}`;
  const y = d.getFullYear();
  if (type === 'task') return `TASK-${n}`;
  if (type === 'rectification') return `RECT-${ym}-${pad(n)}`;
  if (type === 'acceptance') return `ACC-${y}-${pad(n, 4)}`;
  return `ID-${n}`;
}

function createPhase2Seed() {
  const project1Id = 'project-001';
  const project2Id = 'project-002';
  const project3Id = 'project-003';
  const plan1Id = 'plan-001';
  const proposal1Id = 'proposal-001';

  return {
    projectRoles: [
      { id: 'role-001', projectId: project2Id, userId: 'u002', userName: '李华', roleType: 'pm', ratio: 100, joinDate: '2025-01-01' },
      { id: 'role-002', projectId: project2Id, userId: 'u003', userName: '王磊', roleType: 'tech', ratio: 80, joinDate: '2025-01-01' },
      { id: 'role-003', projectId: project2Id, userId: 'u004', userName: '赵敏', roleType: 'qa', ratio: 60, joinDate: '2025-01-01' },
      { id: 'role-004', projectId: project2Id, userId: 'u005', userName: '陈强', roleType: 'member', ratio: 100, joinDate: '2025-01-05' },
      { id: 'role-005', projectId: project2Id, userId: 'u006', userName: '刘洋', roleType: 'member', ratio: 80, joinDate: '2025-01-05' },
    ],
    proposals: [
      {
        id: proposal1Id,
        projectId: project2Id,
        title: '油田数字化平台运维开题报告',
        content: '本项目旨在为新疆油田提供数字化平台持续运维服务，涵盖系统监控、故障响应、版本升级等内容。',
        serviceContent: '7×24 运维值守、月度巡检、应急响应、版本升级',
        teamMembers: [
          { name: '李华', role: '项目经理', duty: '项目统筹', ratio: 100 },
          { name: '王磊', role: '技术负责人', duty: '技术方案', ratio: 80 },
          { name: '赵敏', role: '质量负责人', duty: '成果审核', ratio: 60 },
          { name: '陈强', role: '项目成员', duty: '日常运维', ratio: 100 },
        ],
        auditStatus: 'approved',
        submitTime: '2025-01-10 09:00:00',
        files: [],
        createTime: '2025-01-08 10:00:00',
      },
    ],
    plans: [
      {
        id: plan1Id,
        projectId: project2Id,
        version: 'v1.0',
        planStartDate: '2025-01-01',
        planEndDate: '2026-12-31',
        status: 'active',
        phases: [
          { id: 'phase-001', name: '启动阶段', startDate: '2025-01-01', endDate: '2025-03-31', deliverable: '开题报告' },
          { id: 'phase-002', name: '执行阶段', startDate: '2025-04-01', endDate: '2026-09-30', deliverable: '运维报告' },
          { id: 'phase-003', name: '验收阶段', startDate: '2026-10-01', endDate: '2026-12-31', deliverable: '验收报告' },
        ],
        tasks: [
          { name: '平台环境巡检', phaseId: 'phase-002', assigneeId: 'u005', assigneeName: '陈强', planStartDate: '2025-04-01', planEndDate: '2025-06-30', workload: 15, preTask: '' },
          { name: '月度运维报告编制', phaseId: 'phase-002', assigneeId: 'u006', assigneeName: '刘洋', planStartDate: '2025-05-01', planEndDate: '2025-07-31', workload: 10, preTask: '' },
          { name: '系统升级方案', phaseId: 'phase-002', assigneeId: 'u003', assigneeName: '王磊', planStartDate: '2025-04-15', planEndDate: '2025-08-31', workload: 20, preTask: '' },
        ],
        createTime: '2025-01-12 14:00:00',
      },
    ],
    tasks: [
      {
        id: 'task-p1-001',
        code: 'TASK-PRJ-2025-0001-001',
        projectId: project1Id,
        planId: '',
        phaseId: 'phase-p1',
        phaseName: '执行阶段',
        taskName: '数据中心巡检（返工演示）',
        description: '完成数据中心基础设施巡检并提交报告，驳回后需补充整改说明。',
        assigneeId: 'u005',
        assigneeName: '陈强',
        planStartDate: '2025-05-01',
        planEndDate: '2025-06-30',
        actualStartDate: '2025-05-01',
        actualEndDate: '',
        workload: 8,
        preTaskId: '',
        status: 'in_progress',
        auditResult: 'rejected',
        createTime: '2025-05-01 09:00:00',
      },
      {
        code: 'TASK-PRJ-2025-0088-001',
        projectId: project2Id,
        planId: plan1Id,
        phaseId: 'phase-002',
        phaseName: '执行阶段',
        taskName: '平台环境巡检',
        description: '对油田数字化平台进行全面环境巡检，输出巡检报告。',
        assigneeId: 'u005',
        assigneeName: '陈强',
        planStartDate: '2025-04-01',
        planEndDate: '2025-06-30',
        actualStartDate: '2025-04-01',
        actualEndDate: '',
        workload: 15,
        preTaskId: '',
        status: 'completed',
        createTime: '2025-01-12 15:00:00',
      },
      {
        id: 'task-002',
        code: 'TASK-PRJ-2025-0088-002',
        projectId: project2Id,
        planId: plan1Id,
        phaseId: 'phase-002',
        phaseName: '执行阶段',
        taskName: '月度运维报告编制',
        description: '编制 2025 年 5 月运维月报。',
        assigneeId: 'u006',
        assigneeName: '刘洋',
        planStartDate: '2025-05-01',
        planEndDate: '2025-07-31',
        actualStartDate: '2025-05-01',
        actualEndDate: '',
        workload: 10,
        preTaskId: '',
        status: 'pending_review',
        createTime: '2025-01-12 15:00:00',
      },
      {
        id: 'task-003',
        code: 'TASK-PRJ-2025-0088-003',
        projectId: project2Id,
        planId: plan1Id,
        phaseId: 'phase-002',
        phaseName: '执行阶段',
        taskName: '系统升级方案',
        description: '编制平台 V3.0 升级技术方案。',
        assigneeId: 'u003',
        assigneeName: '王磊',
        planStartDate: '2025-04-15',
        planEndDate: '2025-08-31',
        actualStartDate: '',
        actualEndDate: '',
        workload: 20,
        preTaskId: 'task-001',
        status: 'pending_dispatch',
        createTime: '2025-01-12 15:00:00',
      },
    ],
    deliverables: [
      {
        id: 'del-p1-001',
        taskId: 'task-p1-001',
        projectId: project1Id,
        name: '数据中心巡检报告 v1.0',
        fileType: 'report',
        version: 'v1.0',
        files: [{ name: '巡检报告.pdf', url: '#' }],
        auditStatus: 'rejected',
        uploadTime: '2025-06-17 15:00:00',
        uploaderName: '陈强',
      },
      {
        id: 'del-001',
        taskId: 'task-001',
        projectId: project2Id,
        name: '2025Q2 平台巡检报告',
        fileType: 'report',
        version: 'v1.0',
        files: [],
        auditStatus: 'approved',
        uploadTime: '2025-06-28 16:00:00',
        uploaderName: '陈强',
      },
      {
        id: 'del-002',
        taskId: 'task-002',
        projectId: project2Id,
        name: '2025年5月运维月报',
        fileType: 'report',
        version: 'v1.0',
        files: [],
        auditStatus: 'pending',
        uploadTime: '2025-06-29 10:00:00',
        uploaderName: '刘洋',
      },
    ],
    milestones: [
      { id: 'ms-001', projectId: project2Id, name: '开题报告', type: 'start', planDate: '2025-01-15', actualDate: '2025-01-10', status: 'passed', acceptorName: '李华' },
      {
        id: 'ms-002',
        projectId: project2Id,
        planId: plan1Id,
        planVersion: 'v1.0',
        name: '中期评审',
        type: 'stage',
        planDate: '2025-12-31',
        actualDate: '',
        status: 'in_progress',
        acceptorName: '李华',
      },
      {
        id: 'ms-003',
        projectId: project2Id,
        planId: plan1Id,
        planVersion: 'v1.0',
        name: '成果交付',
        type: 'stage',
        planDate: '2026-09-30',
        actualDate: '',
        status: 'not_started',
        acceptorName: '李华',
      },
      {
        id: 'ms-004',
        projectId: project2Id,
        planId: plan1Id,
        planVersion: 'v1.0',
        name: '项目验收',
        type: 'acceptance',
        planDate: '2026-12-31',
        actualDate: '',
        status: 'not_started',
        acceptorName: '李华',
      },
      { id: 'ms-005', projectId: project3Id, name: '开题报告', type: 'start', planDate: '2025-06-15', actualDate: '2025-06-10', status: 'passed', acceptorName: '张明' },
      { id: 'ms-006', projectId: project3Id, name: '中期评审', type: 'stage', planDate: '2025-12-31', actualDate: '2025-12-20', status: 'passed', acceptorName: '张明' },
      { id: 'ms-007', projectId: project3Id, name: '成果交付', type: 'stage', planDate: '2026-05-31', actualDate: '2026-05-28', status: 'passed', acceptorName: '张明' },
      { id: 'ms-008', projectId: project3Id, name: '项目验收', type: 'acceptance', planDate: '2026-06-30', actualDate: '', status: 'pending_acceptance', acceptorName: '张明' },
    ],
    resultReviews: [
      {
        id: 'review-p1-001',
        taskId: 'task-p1-001',
        projectId: project1Id,
        conclusion: 'rejected',
        opinion: '巡检报告缺少风险项整改说明',
        reviewTime: '2025-06-18 09:30:00',
      },
    ],
    rectifications: [
      {
        id: 'rect-p1-001',
        code: 'RECT-202506-001',
        taskId: 'task-p1-001',
        projectId: project1Id,
        description: '巡检报告缺少风险项整改说明',
        requirement: '补充高风险项处置记录与责任人签字',
        assigneeId: 'u005',
        assigneeName: '陈强',
        deadline: '2025-06-20',
        status: 'pending',
        createTime: '2025-06-18 10:00:00',
      },
    ],
    acceptances: [],
    counters: {
      proposal: 1,
      plan: 1,
      task: 4,
      deliverable: 2,
      milestone: 8,
      rectification: 0,
      acceptance: 0,
      projectRole: 5,
    },
  };
}

function ensureItem(list, item, matchKey = 'id') {
  if (!Array.isArray(list) || !item?.[matchKey]) return false;
  const idx = list.findIndex(row => String(row[matchKey]) === String(item[matchKey]));
  if (idx >= 0) {
    list[idx] = { ...item, ...list[idx] };
    return false;
  }
  list.push(item);
  return true;
}

function ensurePhase2Coverage(s) {
  let changed = false;
  const fixedTask = s.tasks.find(task => task.code === 'TASK-PRJ-2025-0088-001' && !task.id);
  if (fixedTask) {
    fixedTask.id = 'task-001';
    changed = true;
  }

  const projects = s.projects || [];
  projects.forEach(project => {
    const before = JSON.stringify({ contractId: project.contractId, contractCode: project.contractCode, contractIds: project.contractIds, contracts: project.contracts });
    syncProjectContracts(project, s);
    const after = JSON.stringify({ contractId: project.contractId, contractCode: project.contractCode, contractIds: project.contractIds, contracts: project.contracts });
    if (before !== after) changed = true;
  });
  const patchProject = (id, patch) => {
    const project = projects.find(item => item.id === id);
    if (!project) return;
    Object.keys(patch).forEach(key => {
      if (project[key] === undefined || project[key] === null || project[key] === '') {
        project[key] = patch[key];
        changed = true;
      }
    });
  };

  patchProject('project-001', {
    attachments: {
      technicalFiles: [{ name: '地质建模技术方案.docx', url: '#' }],
      qualificationFiles: [{ name: '项目团队资质清单.pdf', url: '#' }],
      otherFiles: [{ name: '立项会议纪要.pdf', url: '#' }],
    },
  });
  patchProject('project-002', {
    attachments: {
      technicalFiles: [{ name: '平台运维服务范围说明.docx', url: '#' }],
      qualificationFiles: [{ name: '运维团队证书包.zip', url: '#' }],
      otherFiles: [{ name: '客户沟通纪要.pdf', url: '#' }],
    },
  });
  patchProject('project-003', {
    attachments: {
      technicalFiles: [{ name: '致密油藏评价成果清单.xlsx', url: '#' }],
      qualificationFiles: [{ name: '联营单位资质文件.pdf', url: '#' }],
      otherFiles: [{ name: '验收申请说明.docx', url: '#' }],
    },
  });

  [
    {
      id: 'proposal-p1-draft',
      projectId: 'project-001',
      title: '新疆油田地质建模技术服务开题报告',
      content: '围绕地质建模、数据治理、模型校核和成果交付建立项目实施方案。',
      serviceContent: '资料收集、地质建模、模型校验、成果汇报',
      teamMembers: [
        { name: '张明', role: '项目经理', duty: '项目统筹', ratio: 100 },
        { name: '王磊', role: '技术负责人', duty: '建模方案', ratio: 80 },
      ],
      auditStatus: 'draft',
      submitTime: '',
      files: [{ name: '开题报告草稿.docx', url: '#' }],
      createTime: '2026-06-29 10:00:00',
    },
    {
      id: 'proposal-p3-submitted',
      projectId: 'project-003',
      title: '致密油藏开发评价开题报告',
      content: '完成油藏评价目标、数据范围、技术路线和里程碑计划确认。',
      serviceContent: '油藏评价、开发建议、成果评审',
      teamMembers: [
        { name: '张明', role: '项目经理', duty: '项目统筹', ratio: 100 },
        { name: '赵敏', role: '质量负责人', duty: '成果质检', ratio: 60 },
      ],
      auditStatus: 'submitted',
      submitTime: '2025-06-05 16:20:00',
      files: [{ name: '开题报告提交版.pdf', url: '#' }],
      createTime: '2025-06-01 09:00:00',
    },
    {
      id: 'proposal-p5-rejected',
      projectId: 'project-005',
      title: '钻井液性能评价开题报告',
      content: '因客户项目暂停，开题材料退回归档。',
      serviceContent: '钻井液取样、性能评价、报告编制',
      teamMembers: [{ name: '张明', role: '项目经理', duty: '项目统筹', ratio: 100 }],
      auditStatus: 'rejected',
      rejectReason: '客户暂停项目，暂不进入实施。',
      submitTime: '2023-03-03 11:00:00',
      files: [{ name: '退回版开题报告.pdf', url: '#' }],
      createTime: '2023-03-01 10:30:00',
    },
  ].forEach(item => {
    changed = ensureItem(s.proposals, item) || changed;
  });

  [
    {
      id: 'plan-p1-draft',
      projectId: 'project-001',
      version: 'v0.1',
      planStartDate: '2026-07-01',
      planEndDate: '2027-06-30',
      status: 'draft',
      phases: [
        { id: 'phase-p1-01', name: '准备阶段', startDate: '2026-07-01', endDate: '2026-08-31', deliverable: '资料清单' },
        { id: 'phase-p1-02', name: '建模阶段', startDate: '2026-09-01', endDate: '2027-03-31', deliverable: '地质模型' },
      ],
      tasks: [{ name: '资料收集与校验', phaseId: 'phase-p1-01', assigneeId: 'u003', assigneeName: '王磊', planStartDate: '2026-07-01', planEndDate: '2026-08-15', workload: 12, preTask: '' }],
      createTime: '2026-06-30 09:30:00',
    },
    {
      id: 'plan-p3-active',
      projectId: 'project-003',
      version: 'v1.0',
      planStartDate: '2025-06-01',
      planEndDate: '2026-05-31',
      status: 'active',
      phases: [
        { id: 'phase-p3-01', name: '评价阶段', startDate: '2025-06-01', endDate: '2025-12-31', deliverable: '评价报告' },
        { id: 'phase-p3-02', name: '交付阶段', startDate: '2026-01-01', endDate: '2026-05-31', deliverable: '验收材料' },
      ],
      tasks: [
        { name: '油藏参数复核', phaseId: 'phase-p3-01', assigneeId: 'u003', assigneeName: '王磊', planStartDate: '2025-06-01', planEndDate: '2025-09-30', workload: 18, preTask: '' },
        { name: '开发评价报告编制', phaseId: 'phase-p3-02', assigneeId: 'u004', assigneeName: '赵敏', planStartDate: '2026-01-01', planEndDate: '2026-05-20', workload: 22, preTask: '油藏参数复核' },
      ],
      createTime: '2025-06-03 09:00:00',
    },
    {
      id: 'plan-p4-archived',
      projectId: 'project-004',
      version: 'v0.9',
      planStartDate: '2024-06-01',
      planEndDate: '2025-05-31',
      status: 'archived',
      archiveReason: '已按最终执行计划完成归档',
      archiveTime: '2025-05-31 18:00:00',
      phases: [{ id: 'phase-p4-01', name: '储量评估', startDate: '2024-06-01', endDate: '2025-05-31', deliverable: '储量评估报告' }],
      tasks: [{ name: '储量评估报告编制', phaseId: 'phase-p4-01', assigneeId: 'u006', assigneeName: '刘洋', planStartDate: '2024-06-01', planEndDate: '2025-05-20', workload: 20, preTask: '' }],
      createTime: '2024-06-01 09:00:00',
    },
  ].forEach(item => {
    changed = ensureItem(s.plans, item) || changed;
  });

  [
    {
      id: 'task-004',
      code: 'TASK-PRJ-2025-0088-004',
      projectId: 'project-002',
      planId: 'plan-001',
      phaseId: 'phase-002',
      phaseName: '执行阶段',
      taskName: '应急预案演练',
      description: '组织运维应急预案演练并记录演练问题。',
      assigneeId: 'u005',
      assigneeName: '陈强',
      planStartDate: '2026-07-01',
      planEndDate: '2026-08-15',
      actualStartDate: '',
      actualEndDate: '',
      workload: 6,
      preTaskId: '',
      status: 'dispatched',
      dispatchTime: '2026-07-02 09:30:00',
      createTime: '2025-01-12 15:00:00',
      changeLogs: [
        { id: 'log-004', action: 'dispatch', time: '2026-07-02 09:30:00', before: {}, after: { assigneeName: '陈强', planStartDate: '2026-07-01', planEndDate: '2026-08-15' }, note: '按运维计划派发' },
      ],
    },
    {
      id: 'task-005',
      code: 'TASK-PRJ-2025-0088-005',
      projectId: 'project-002',
      planId: 'plan-001',
      phaseId: 'phase-002',
      phaseName: '执行阶段',
      taskName: '旧版接口兼容测试',
      description: '客户确认旧版接口停用后取消该测试任务。',
      assigneeId: 'u006',
      assigneeName: '刘洋',
      planStartDate: '2025-09-01',
      planEndDate: '2025-09-20',
      actualStartDate: '',
      actualEndDate: '',
      workload: 4,
      preTaskId: '',
      status: 'cancelled',
      cancelReason: '客户取消旧版接口兼容范围',
      cancelTime: '2025-09-02 10:00:00',
      createTime: '2025-01-12 15:00:00',
    },
    {
      id: 'task-p3-001',
      code: 'TASK-PRJ-2025-0042-001',
      projectId: 'project-003',
      planId: 'plan-p3-active',
      phaseId: 'phase-p3-01',
      phaseName: '评价阶段',
      taskName: '油藏参数复核',
      description: '复核致密油藏关键参数并形成复核记录。',
      assigneeId: 'u003',
      assigneeName: '王磊',
      planStartDate: '2025-06-01',
      planEndDate: '2025-09-30',
      actualStartDate: '2025-06-01',
      actualEndDate: '2025-09-26',
      workload: 18,
      preTaskId: '',
      status: 'completed',
      auditResult: 'approved',
      createTime: '2025-06-03 10:00:00',
    },
    {
      id: 'task-p3-002',
      code: 'TASK-PRJ-2025-0042-002',
      projectId: 'project-003',
      planId: 'plan-p3-active',
      phaseId: 'phase-p3-02',
      phaseName: '交付阶段',
      taskName: '开发评价报告编制',
      description: '编制开发评价报告和验收材料。',
      assigneeId: 'u004',
      assigneeName: '赵敏',
      planStartDate: '2026-01-01',
      planEndDate: '2026-05-20',
      actualStartDate: '2026-01-05',
      actualEndDate: '2026-05-18',
      workload: 22,
      preTaskId: 'task-p3-001',
      status: 'completed',
      auditResult: 'approved',
      createTime: '2025-06-03 10:10:00',
    },
  ].forEach(item => {
    changed = ensureItem(s.tasks, item) || changed;
  });

  [
    {
      id: 'del-003',
      taskId: 'task-004',
      projectId: 'project-002',
      name: '应急预案演练记录',
      fileType: 'report',
      version: 'v0.1',
      files: [{ name: '演练记录草稿.docx', url: '#' }],
      auditStatus: 'draft',
      uploadTime: '2026-07-03 11:00:00',
      uploaderName: '陈强',
      createTime: '2026-07-03 11:00:00',
    },
    {
      id: 'del-p3-001',
      taskId: 'task-p3-001',
      projectId: 'project-003',
      name: '油藏参数复核记录',
      fileType: 'report',
      version: 'v1.0',
      files: [{ name: '参数复核记录.pdf', url: '#' }],
      auditStatus: 'approved',
      uploadTime: '2025-09-26 17:00:00',
      uploaderName: '王磊',
      createTime: '2025-09-26 17:00:00',
    },
    {
      id: 'del-p3-002',
      taskId: 'task-p3-002',
      projectId: 'project-003',
      name: '开发评价报告',
      fileType: 'report',
      version: 'v1.0',
      files: [{ name: '开发评价报告.pdf', url: '#' }],
      auditStatus: 'approved',
      uploadTime: '2026-05-18 17:00:00',
      uploaderName: '赵敏',
      createTime: '2026-05-18 17:00:00',
    },
  ].forEach(item => {
    changed = ensureItem(s.deliverables, item) || changed;
  });

  [
    { id: 'role-p1-001', projectId: 'project-001', userId: 'u001', userName: '张明', roleType: 'pm', ratio: 100, joinDate: '2026-06-28' },
    { id: 'role-p1-002', projectId: 'project-001', userId: 'u003', userName: '王磊', roleType: 'tech', ratio: 80, joinDate: '2026-06-28' },
    { id: 'role-p3-001', projectId: 'project-003', userId: 'u001', userName: '张明', roleType: 'pm', ratio: 100, joinDate: '2025-06-01' },
    { id: 'role-p3-002', projectId: 'project-003', userId: 'u004', userName: '赵敏', roleType: 'qa', ratio: 60, joinDate: '2025-06-01' },
  ].forEach(item => {
    changed = ensureItem(s.projectRoles, item) || changed;
  });

  [
    { id: 'ms-p1-001', projectId: 'project-001', name: '开题报告', type: 'start', planDate: '2026-07-15', actualDate: '', status: 'in_progress', acceptorName: '张明' },
    { id: 'ms-p1-002', projectId: 'project-001', name: '中期评审', type: 'stage', planDate: '2027-01-31', actualDate: '', status: 'not_started', acceptorName: '张明' },
    { id: 'ms-p5-001', projectId: 'project-005', name: '开题报告', type: 'start', planDate: '2023-03-10', actualDate: '2023-03-08', status: 'rejected', acceptorName: '张明' },
  ].forEach(item => {
    changed = ensureItem(s.milestones, item) || changed;
  });

  [
    { id: 'review-001', taskId: 'task-001', projectId: 'project-002', conclusion: 'approved', opinion: '巡检报告内容完整，同意通过。', reviewTime: '2025-06-29 09:00:00' },
    { id: 'review-002', taskId: 'task-002', projectId: 'project-002', conclusion: 'rejected', opinion: '月报缺少服务 SLA 达成说明。', reviewTime: '2025-06-30 14:20:00' },
    { id: 'review-p3-001', taskId: 'task-p3-001', projectId: 'project-003', conclusion: 'approved', opinion: '参数复核记录通过。', reviewTime: '2025-09-27 09:20:00' },
    { id: 'review-p3-002', taskId: 'task-p3-002', projectId: 'project-003', conclusion: 'approved', opinion: '开发评价报告通过。', reviewTime: '2026-05-19 10:30:00' },
  ].forEach(item => {
    changed = ensureItem(s.resultReviews, item) || changed;
  });

  [
    {
      id: 'rect-002',
      code: 'RECT-202506-002',
      taskId: 'task-002',
      projectId: 'project-002',
      description: '月报缺少 SLA 达成说明',
      requirement: '补充 SLA 指标及客户确认记录',
      assigneeId: 'u006',
      assigneeName: '刘洋',
      deadline: '2025-07-03',
      status: 'rectifying',
      createTime: '2025-06-30 15:00:00',
      history: [{ action: 'start', time: '2025-07-01 09:00:00' }],
    },
    {
      id: 'rect-003',
      code: 'RECT-202506-003',
      taskId: 'task-002',
      projectId: 'project-002',
      description: '运维截图不清晰',
      requirement: '重新上传关键截图',
      assigneeId: 'u006',
      assigneeName: '刘洋',
      deadline: '2025-07-04',
      status: 'reviewing',
      createTime: '2025-06-30 15:10:00',
      history: [{ action: 'submit', time: '2025-07-02 10:00:00' }],
    },
    {
      id: 'rect-004',
      code: 'RECT-202506-004',
      taskId: 'task-001',
      projectId: 'project-002',
      description: '补充风险闭环说明',
      requirement: '已补充并复核关闭',
      assigneeId: 'u005',
      assigneeName: '陈强',
      deadline: '2025-07-01',
      status: 'closed',
      createTime: '2025-06-28 10:00:00',
      verifyTime: '2025-06-30 11:00:00',
    },
    {
      id: 'rect-005',
      code: 'RECT-202506-005',
      taskId: 'task-002',
      projectId: 'project-002',
      description: '报告格式需统一',
      requirement: '按模板重新排版',
      assigneeId: 'u006',
      assigneeName: '刘洋',
      deadline: '2025-07-05',
      status: 'returned',
      createTime: '2025-06-30 15:20:00',
      verifyOpinion: '排版仍不符合模板',
    },
    {
      id: 'rect-p3-acc-001',
      code: 'RECT-202606-001',
      taskId: 'task-p3-002',
      projectId: 'project-003',
      acceptanceId: 'acc-p3-conditional',
      source: 'acceptance',
      description: '验收有条件通过遗留项',
      requirement: '补充开发建议风险清单后申请复验',
      assigneeId: 'u004',
      assigneeName: '赵敏',
      deadline: '2026-06-20',
      status: 'pending',
      createTime: '2026-06-10 10:30:00',
    },
  ].forEach(item => {
    changed = ensureItem(s.rectifications, item) || changed;
  });

  [
    {
      id: 'acc-p2-interim',
      code: 'ACC-2025-0001',
      projectId: 'project-002',
      acceptanceType: 'interim',
      acceptanceDate: '2025-12-30',
      conclusion: 'passed',
      opinion: '中期验收通过，继续按计划推进。',
      files: [{ name: '中期验收记录.pdf', url: '#' }],
      revoked: false,
      createTime: '2025-12-30 16:00:00',
    },
    {
      id: 'acc-p3-conditional',
      code: 'ACC-2026-0002',
      projectId: 'project-003',
      acceptanceType: 'final',
      acceptanceDate: '2026-06-10',
      conclusion: 'conditional',
      opinion: '成果基本满足要求，补充风险清单后复验。',
      files: [{ name: '有条件验收意见.pdf', url: '#' }],
      revoked: false,
      createTime: '2026-06-10 10:00:00',
    },
    {
      id: 'acc-p4-final',
      code: 'ACC-2025-0003',
      projectId: 'project-004',
      acceptanceType: 'final',
      acceptanceDate: '2025-05-30',
      conclusion: 'passed',
      opinion: '最终验收通过，项目归档。',
      files: [{ name: '最终验收报告.pdf', url: '#' }],
      revoked: false,
      createTime: '2025-05-30 17:00:00',
    },
    {
      id: 'acc-p5-failed',
      code: 'ACC-2023-0004',
      projectId: 'project-005',
      acceptanceType: 'final',
      acceptanceDate: '2023-08-20',
      conclusion: 'failed',
      opinion: '客户终止项目，验收不通过并归档终止。',
      files: [{ name: '终止验收说明.pdf', url: '#' }],
      revoked: false,
      createTime: '2023-08-20 15:00:00',
    },
  ].forEach(item => {
    changed = ensureItem(s.acceptances, item) || changed;
  });

  return changed;
}

export function ensurePhase2() {
  const s = loadStore();
  const keys = ['projectRoles', 'proposals', 'plans', 'tasks', 'deliverables', 'milestones', 'resultReviews', 'rectifications', 'acceptances'];
  let needSeed = false;
  keys.forEach(k => {
    if (!Array.isArray(s[k])) {
      s[k] = [];
      needSeed = true;
    }
  });
  if (!s.counters) s.counters = {};
  if (needSeed || !s._phase2Seeded) {
    const seed = createPhase2Seed();
    keys.forEach(k => {
      s[k] = seed[k] || [];
    });
    Object.assign(s.counters, seed.counters);
    s._phase2Seeded = true;
    saveStore();
  }
  if (ensurePhase2Coverage(s)) {
    saveStore();
  }
  return s;
}

function paginate(list, current = 1, size = 10) {
  const start = (current - 1) * size;
  return { records: list.slice(start, start + size), total: list.length, current, size };
}

function filterList(list, query = {}) {
  return list.filter(item =>
    Object.keys(query).every(key => {
      const val = query[key];
      if (val === undefined || val === null || val === '') return true;
      if (key === 'projectName') return String(item.projectName || '').includes(String(val));
      if (key === 'projectCode') return String(item.projectCode || '').includes(String(val));
      return String(item[key]) === String(val);
    }),
  );
}

function isTaskOverdue(task) {
  if (!task?.planEndDate) return false;
  if (['completed', 'cancelled'].includes(task.status)) return false;
  return task.planEndDate < today();
}

function withTaskDisplayStatus(task) {
  if (!task) return task;
  if (!isTaskOverdue(task)) return task;
  return {
    ...task,
    rawStatus: task.status,
    status: 'overdue',
    overdue: true,
  };
}

export function enrichProjectMeta(list, store) {
  const s = store || ensurePhase2();
  return list.map(item => {
    if (!item.projectId) return item;
    const p = s.projects.find(x => x.id === item.projectId);
    return {
      ...item,
      projectName: p?.projectName || item.projectName || '',
      projectCode: p?.code || item.projectCode || '',
    };
  });
}

export function getTaskSummary() {
  const s = ensurePhase2();
  const tasks = s.tasks.map(withTaskDisplayStatus);
  const done = tasks.filter(t => t.status === 'completed').length;
  return {
    pendingDispatch: tasks.filter(t => t.status === 'pending_dispatch').length,
    inProgress: tasks.filter(t => ['dispatched', 'in_progress'].includes(t.status)).length,
    pendingReview: tasks.filter(t => t.status === 'pending_review').length,
    completed: done,
    total: tasks.length,
    progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

export function getPhase2Stats() {
  const s = ensurePhase2();
  const taskSummary = getTaskSummary();
  return {
    proposals: s.proposals.length,
    plans: s.plans.length,
    tasks: s.tasks.length,
    deliverables: s.deliverables.length,
    milestones: s.milestones.length,
    acceptances: s.acceptances.length,
    pendingReview: taskSummary.pendingReview,
    pendingDispatch: taskSummary.pendingDispatch,
    inProgress: taskSummary.inProgress,
  };
}

const DEFAULT_MILESTONES = [
  { name: '开题报告', type: 'start' },
  { name: '中期评审', type: 'stage' },
  { name: '成果交付', type: 'stage' },
  { name: '项目验收', type: 'acceptance' },
];

export function createDefaultMilestones(projectId, planEndDate) {
  const s = ensurePhase2();
  const existing = s.milestones.filter(m => m.projectId === projectId);
  if (existing.length) return existing;
  DEFAULT_MILESTONES.forEach((m, idx) => {
    s.milestones.push({
      id: genId('ms'),
      projectId,
      name: m.name,
      type: m.type,
      planDate: planEndDate || '',
      actualDate: '',
      status: idx === 0 ? 'in_progress' : 'not_started',
      acceptorName: '',
    });
  });
  saveStore();
}

export function syncRolesFromProposal(proposal) {
  const s = ensurePhase2();
  // 仅首次审核通过时同步团队，避免覆盖执行中手动维护的角色
  const existing = s.projectRoles.filter(r => r.projectId === proposal.projectId);
  if (existing.length) return;
  const roleMap = { 项目经理: 'pm', 技术负责人: 'tech', 质量负责人: 'qa', 项目成员: 'member' };
  (proposal.teamMembers || []).forEach((m, idx) => {
    s.projectRoles.push({
      id: genId('role'),
      projectId: proposal.projectId,
      userId: `u${100 + idx}`,
      userName: m.name,
      roleType: roleMap[m.role] || 'member',
      ratio: m.ratio ?? 100,
      joinDate: today(),
    });
  });
  saveStore();
}

export function approveProposal(proposalId) {
  const s = ensurePhase2();
  const p = s.proposals.find(x => x.id === proposalId);
  if (!p) return mockResponse(null);
  p.auditStatus = 'approved';
  const project = s.projects.find(x => x.id === p.projectId);
  if (project) {
    project.status = 'ongoing';
    createDefaultMilestones(project.id, project.planEndDate);
    const ms = s.milestones.find(m => m.projectId === project.id && m.name === '开题报告');
    if (ms) {
      ms.status = 'passed';
      ms.actualDate = today();
    }
  }
  syncRolesFromProposal(p);
  saveStore();
  return mockResponse(p);
}

/**
 * 开题报告驳回（回到草稿，可继续编辑后重新提交）
 */
export function rejectProposal(proposalId, opinion = '') {
  const s = ensurePhase2();
  const p = s.proposals.find(x => x.id === proposalId);
  if (!p) return mockResponse(null);
  p.auditStatus = 'rejected';
  p.rejectReason = opinion;
  p.submitTime = '';
  s.resultReviews.push({
    id: genId('review'),
    taskId: '',
    projectId: p.projectId,
    proposalId: p.id,
    conclusion: 'rejected',
    opinion,
    reviewTime: now(),
  });
  saveStore();
  return mockResponse(p);
}

/**
 * 递归校验前置任务链路（A→B→C 中 A 未完成则 C 不可派发）
 */
export function checkPreTasks(taskIds) {
  const s = ensurePhase2();
  const blocked = [];
  const visited = new Set();

  const walkChain = (taskId, path) => {
    if (visited.has(taskId)) return; // 防环
    visited.add(taskId);
    const t = s.tasks.find(x => x.id === taskId);
    if (!t?.preTaskId) return;
    const pre = s.tasks.find(x => x.id === t.preTaskId);
    if (!pre) return;
    if (pre.status !== 'completed') {
      blocked.push({ taskName: t.taskName, preTaskName: pre.taskName, preStatus: pre.status });
    }
    // 递归向上检查
    walkChain(pre.id, [...path, pre.id]);
  };

  (Array.isArray(taskIds) ? taskIds : [taskIds]).forEach(id => {
    visited.clear();
    walkChain(id, [id]);
  });
  return mockResponse({ blocked, ok: !blocked.length });
}

export function getTaskDetail(taskId) {
  const s = ensurePhase2();
  const task = s.tasks.find(x => x.id === taskId);
  if (!task) return mockResponse(null);
  const p = s.projects.find(x => x.id === task.projectId);
  const plan = s.plans.find(x => x.id === task.planId);
  const phase = (plan?.phases || []).find(ph => ph.id === task.phaseId);
  const deliverables = s.deliverables.filter(d => d.taskId === taskId);
  const reviews = s.resultReviews.filter(r => r.taskId === taskId);
  const rectifications = s.rectifications.filter(r => r.taskId === taskId);
  return mockResponse({
    task: {
      ...task,
      projectName: p?.projectName || '',
      projectCode: p?.code || '',
      phaseName: task.phaseName || phase?.name || '',
      deliverableCount: deliverables.length,
    },
    deliverables,
    reviews,
    rectifications,
    changeLogs: task.changeLogs || [],
  });
}

/**
 * 新增成果物（同名同任务自动归档旧版本）
 */
export function addDeliverable(row) {
  const s = ensurePhase2();
  s.deliverables
    .filter(d => d.taskId === row.taskId && (d.name || '').trim() === (row.name || '').trim() && d.isCurrent !== false)
    .forEach(d => {
      d.isCurrent = false;
      d.archivedTime = now();
    });
  const item = {
    ...row,
    id: row.id || genId('del'),
    isCurrent: true,
    auditStatus: row.auditStatus || 'draft',
    createTime: row.createTime || now(),
    uploadTime: row.uploadTime || now(),
  };
  s.deliverables.unshift(item);
  saveStore();
  return mockResponse(item);
}

/**
 * 成果物提交审核（与任务审核解耦）
 */
export function submitDeliverableForReview(deliverableId) {
  const s = ensurePhase2();
  const d = s.deliverables.find(x => x.id === deliverableId);
  if (!d) return mockResponse(null);
  if (d.isCurrent === false) return Promise.reject(new Error('旧版本成果物不可提交审核'));
  d.auditStatus = 'pending';
  d.submitReviewTime = now();
  saveStore();
  return mockResponse(d);
}

/**
 * 项目团队成员维护
 */
export function updateProjectRoles(projectId, roles) {
  const s = ensurePhase2();
  s.projectRoles = s.projectRoles.filter(r => r.projectId !== projectId);
  (roles || []).forEach(r => {
    s.projectRoles.push({
      id: r.id || genId('role'),
      projectId,
      userId: r.userId || '',
      userName: r.userName || '',
      roleType: r.roleType || 'member',
      ratio: Number(r.ratio) || 0,
      joinDate: r.joinDate || today(),
    });
  });
  saveStore();
  return mockResponse(s.projectRoles.filter(r => r.projectId === projectId));
}

function resolvePhaseName(plan, phaseId) {
  return (plan?.phases || []).find(ph => ph.id === phaseId)?.name || '';
}

function resolvePreTaskId(plan, projectId, preTaskName, existingTasks) {
  if (!preTaskName) return '';
  const byName = (existingTasks || []).find(t => t.taskName === preTaskName);
  if (byName) return byName.id;
  const planTask = (plan?.tasks || []).find(t => t.name === preTaskName);
  if (!planTask) return '';
  const match = (existingTasks || []).find(t => t.projectId === projectId && t.taskName === planTask.name);
  return match?.id || '';
}

/** 计划生效/修订时，将里程碑计划日期与阶段周期对齐 */
export function syncMilestonesFromPlan(plan) {
  const s = ensurePhase2();
  if (!plan?.projectId) return;
  const msList = s.milestones.filter(m => m.projectId === plan.projectId);
  if (!msList.length) return;
  const phases = plan.phases || [];
  const midPhase = phases.length > 1 ? phases[Math.floor((phases.length - 1) / 2)] : phases[0];
  const deliverPhase = phases.find(p => /成果|交付/.test(p.deliverable || p.name || '')) || phases[phases.length - 1] || phases[0];
  const acceptPhase = phases[phases.length - 1] || phases[0];

  msList.forEach(m => {
    m.planId = plan.id;
    m.planVersion = plan.version || '';
    if (m.name === '中期评审') m.planDate = midPhase?.endDate || plan.planEndDate || m.planDate;
    else if (m.name === '成果交付') m.planDate = deliverPhase?.endDate || plan.planEndDate || m.planDate;
    else if (m.name === '项目验收') m.planDate = plan.planEndDate || acceptPhase?.endDate || m.planDate;
    else if (m.name === '开题报告' && !m.planDate) m.planDate = phases[0]?.endDate || plan.planStartDate || m.planDate;
  });
  saveStore();
}

export function activatePlan(planId) {
  const s = ensurePhase2();
  const plan = s.plans.find(x => x.id === planId);
  if (!plan) return mockResponse(null);
  // 强制单 active：把同项目其他 active 计划归档
  s.plans
    .filter(p => p.projectId === plan.projectId && p.id !== plan.id && p.status === 'active')
    .forEach(p => {
      p.status = 'archived';
      p.archiveReason = '被新版本计划替换';
      p.archiveTime = now();
    });
  plan.status = 'active';
  const project = s.projects.find(x => x.id === plan.projectId);
  const prjCode = project?.code?.replace(/-/g, '-') || 'PRJ';
  let seq = s.tasks.filter(t => t.projectId === plan.projectId).length;
  (plan.tasks || []).forEach(t => {
    const exists = s.tasks.find(x => x.projectId === plan.projectId && x.taskName === t.name);
    if (exists) return;
    seq += 1;
    const preTaskId = resolvePreTaskId(
      plan,
      plan.projectId,
      t.preTask,
      s.tasks.filter(x => x.projectId === plan.projectId),
    );
    s.tasks.push({
      id: genId('task'),
      code: `TASK-${prjCode}-${pad(seq)}`,
      projectId: plan.projectId,
      planId: plan.id,
      phaseId: t.phaseId,
      phaseName: resolvePhaseName(plan, t.phaseId),
      taskName: t.name,
      description: t.description || t.name,
      assigneeId: t.assigneeId || '',
      assigneeName: t.assigneeName || '',
      planStartDate: t.planStartDate,
      planEndDate: t.planEndDate,
      actualStartDate: '',
      actualEndDate: '',
      workload: t.workload || 0,
      preTaskId: preTaskId || t.preTaskId || '',
      status: 'pending_dispatch',
      createTime: now(),
    });
  });
  syncMilestonesFromPlan(plan);
  saveStore();
  return mockResponse(plan);
}

/**
 * 派发任务。
 * - 旧签名：dispatchTasks(taskIds, payload) — 同一责任人派给所有任务（兼容旧调用）
 * - 新签名：dispatchTasks(dispatchItems, options) — 按任务逐条派发
 *   dispatchItems: [{ taskId, assigneeId, assigneeName, planStartDate, planEndDate, note }]
 *   options: { skipOverwriteAssignee?: boolean }  跳过覆盖责任人（保留计划原值）
 */
export function dispatchTasks(taskIdsOrItems, payloadOrOptions = {}) {
  const s = ensurePhase2();
  const blocked = [];
  const isArray = Array.isArray(taskIdsOrItems);

  // 兼容两种调用形态
  let items;
  let options = {};
  if (isArray && taskIdsOrItems.length && typeof taskIdsOrItems[0] === 'object' && taskIdsOrItems[0].taskId) {
    items = taskIdsOrItems;
    options = payloadOrOptions || {};
  } else {
    // 旧调用：taskIds + payload
    const ids = isArray ? taskIdsOrItems : [taskIdsOrItems];
    const payload = payloadOrOptions || {};
    items = ids.map(id => ({
      taskId: id,
      assigneeId: payload.assigneeId,
      assigneeName: payload.assigneeName,
      planStartDate: payload.planStartDate,
      planEndDate: payload.planEndDate,
      note: payload.note,
    }));
  }

  // 先全量校验前置依赖（避免部分派发成功）
  const preCheckRes = checkPreTasks(items.map(it => it.taskId));
  const preBlocked = (() => {
    try {
      // checkPreTasks 返回 mockResponse 包装
      const inner = typeof preCheckRes.then === 'function' ? null : preCheckRes;
      return inner?.data?.data?.blocked || [];
    } catch (e) {
      return [];
    }
  })();
  if (preBlocked.length) {
    return Promise.reject(new Error(`前置任务未完成：${preBlocked.map(b => b.taskName || b).join('、')}`));
  }

  items.forEach(it => {
    const t = s.tasks.find(x => x.id === it.taskId);
    if (!t || t.status !== 'pending_dispatch') return;
    const before = {
      assigneeName: t.assigneeName,
      planStartDate: t.planStartDate,
      planEndDate: t.planEndDate,
    };
    if (!options.skipOverwriteAssignee && it.assigneeId) t.assigneeId = it.assigneeId;
    if (!options.skipOverwriteAssignee && it.assigneeName) t.assigneeName = it.assigneeName;
    if (it.planStartDate) t.planStartDate = it.planStartDate;
    if (it.planEndDate) t.planEndDate = it.planEndDate;
    t.dispatchNote = it.note || '';
    t.dispatchTime = now();
    t.status = 'dispatched';
    if (!Array.isArray(t.changeLogs)) t.changeLogs = [];
    t.changeLogs.unshift({
      id: genId('log'),
      action: 'dispatch',
      time: now(),
      before,
      after: {
        assigneeName: t.assigneeName,
        planStartDate: t.planStartDate,
        planEndDate: t.planEndDate,
      },
      note: it.note || '',
    });
  });
  if (blocked.length) {
    return Promise.reject(new Error(`前置任务未完成：${blocked.join('、')}`));
  }
  saveStore();
  return mockResponse(true);
}

export function startTask(taskId) {
  const s = ensurePhase2();
  const t = s.tasks.find(x => x.id === taskId);
  if (t && ['dispatched', 'in_progress', 'rejected'].includes(t.status)) {
    t.status = 'in_progress';
    if (!t.actualStartDate) t.actualStartDate = today();
    saveStore();
  }
  return mockResponse(t);
}

export function submitTaskReview(taskId) {
  const s = ensurePhase2();
  const t = s.tasks.find(x => x.id === taskId);
  if (t) {
    t.status = 'pending_review';
    saveStore();
  }
  return mockResponse(t);
}

export function approveReview(taskId, opinion = '') {
  const s = ensurePhase2();
  const t = s.tasks.find(x => x.id === taskId);
  if (!t) return mockResponse(null);
  t.status = 'completed';
  t.actualEndDate = today();
  t.auditResult = 'approved';
  s.deliverables
    .filter(d => d.taskId === taskId)
    .forEach(d => {
      d.auditStatus = 'approved';
    });
  s.resultReviews.push({
    id: genId('review'),
    taskId,
    projectId: t.projectId,
    conclusion: 'approved',
    opinion,
    reviewTime: now(),
  });
  saveStore();
  return mockResponse(t);
}

export function rejectReview(taskId, opinion) {
  const s = ensurePhase2();
  const t = s.tasks.find(x => x.id === taskId);
  if (!t) return mockResponse(null);
  t.status = 'in_progress';
  t.auditResult = 'rejected';
  s.deliverables
    .filter(d => d.taskId === taskId)
    .forEach(d => {
      d.auditStatus = 'rejected';
    });
  // deadline 默认 +3 个工作日（简易实现：+3 自然日）
  const dl = new Date();
  dl.setDate(dl.getDate() + 3);
  const deadlineStr = dl.toISOString().slice(0, 10);
  const rect = {
    id: genId('rect'),
    code: genCode('rectification'),
    taskId,
    projectId: t.projectId,
    description: opinion,
    requirement: opinion,
    assigneeId: t.assigneeId,
    assigneeName: t.assigneeName,
    deadline: deadlineStr,
    status: 'pending',
    createTime: now(),
    history: [{ action: 'create', opinion, time: now() }],
  };
  s.rectifications.push(rect);
  s.resultReviews.push({
    id: genId('review'),
    taskId,
    projectId: t.projectId,
    conclusion: 'rejected',
    opinion,
    reviewTime: now(),
  });
  saveStore();
  return mockResponse(rect);
}

/**
 * 整改单：执行人开始整改（pending → rectifying）
 */
export function startRectification(rectId) {
  const s = ensurePhase2();
  const r = s.rectifications.find(x => x.id === rectId);
  if (!r) return mockResponse(null);
  if (r.status !== 'pending') return mockResponse(r);
  r.status = 'rectifying';
  r.startTime = now();
  (r.history = r.history || []).push({ action: 'start', time: now() });
  saveStore();
  return mockResponse(r);
}

/**
 * 整改单：执行人提交整改完成，进入待质负复核
 */
export function submitRectification(rectId, opinion = '') {
  const s = ensurePhase2();
  const r = s.rectifications.find(x => x.id === rectId);
  if (!r) return mockResponse(null);
  if (!['rectifying', 'returned'].includes(r.status)) {
    return Promise.reject(new Error('当前状态不可提交复核，请先开始整改'));
  }
  r.status = 'reviewing';
  r.submitTime = now();
  (r.history = r.history || []).push({ action: 'submit', opinion, time: now() });
  saveStore();
  return mockResponse(r);
}

export function verifyRectification(id, passed = true, opinion = '') {
  const s = ensurePhase2();
  const r = s.rectifications.find(x => x.id === id);
  if (!r) return mockResponse(null);
  // passed=true 关闭整改 → 任务回到 in_progress 待重新提交审核
  // passed=false 退回执行人继续整改
  r.status = passed ? 'closed' : 'returned';
  r.verifyTime = now();
  r.verifyOpinion = opinion;
  (r.history = r.history || []).push({ action: passed ? 'close' : 'return', opinion, time: now() });
  if (passed) {
    const t = s.tasks.find(x => x.id === r.taskId);
    if (t && t.status === 'in_progress') {
      // 保持 in_progress，执行人需重新 submitReview
    }
  }
  saveStore();
  return mockResponse(r);
}

function createAcceptanceRectifications(s, project, acceptance, opinion) {
  if (!project || !acceptance || acceptance.acceptanceType === 'interim') return [];
  const projectTasks = (s.tasks || []).filter(t => t.projectId === project.id);
  const targetTasks = projectTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const fallbackTask = projectTasks.slice().sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')))[0];
  const tasks = targetTasks.length ? targetTasks : fallbackTask ? [fallbackTask] : [];
  const dl = new Date();
  dl.setDate(dl.getDate() + 3);
  const deadlineStr = dl.toISOString().slice(0, 10);
  return tasks.map(task => {
    const requirement = opinion || (acceptance.conclusion === 'conditional' ? '验收有条件通过，请完成遗留问题整改后申请复验' : '验收不通过，请完成整改后重新发起最终验收');
    const rect = {
      id: genId('rect'),
      code: genCode('rectification'),
      taskId: task.id,
      projectId: project.id,
      acceptanceId: acceptance.id,
      source: 'acceptance',
      description: requirement,
      requirement,
      assigneeId: task.assigneeId || project.projectManagerId || '',
      assigneeName: task.assigneeName || project.projectManagerName || '',
      deadline: deadlineStr,
      status: 'pending',
      createTime: now(),
      history: [{ action: 'create_from_acceptance', opinion: requirement, time: now() }],
    };
    s.rectifications.push(rect);
    return rect;
  });
}

export function passMilestone(milestoneId, opinion = '') {
  const s = ensurePhase2();
  const m = s.milestones.find(x => x.id === milestoneId);
  if (!m) return mockResponse(null);
  m.status = 'passed';
  m.actualDate = today();
  m.opinion = opinion;
  saveStore();
  return mockResponse(m);
}

/**
 * 里程碑串行校验：上一未过则不允许当前里程碑验收
 */
export function canPassMilestone(milestoneId) {
  const s = ensurePhase2();
  const m = s.milestones.find(x => x.id === milestoneId);
  if (!m) return mockResponse({ ok: false, reason: '里程碑不存在' });
  // 按 createDefaultMilestones 顺序串行
  const order = ['开题报告', '中期评审', '成果交付', '项目验收'];
  const siblings = s.milestones.filter(x => x.projectId === m.projectId).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  const idx = siblings.findIndex(x => x.id === milestoneId);
  for (let i = 0; i < idx; i += 1) {
    if (siblings[i].status !== 'passed') {
      return mockResponse({
        ok: false,
        reason: `前置里程碑「${siblings[i].name}」未通过，无法验收当前里程碑`,
        blocker: siblings[i],
      });
    }
  }
  // 计划日期未到则告警（不阻断，但 UI 应提示）
  if (m.planDate && new Date(m.planDate) > new Date()) {
    return mockResponse({
      ok: true,
      warn: `里程碑计划日期（${m.planDate}）尚未到达，请确认是否提前验收`,
    });
  }
  return mockResponse({ ok: true });
}

/**
 * 撤销里程碑通过（误操作救济）
 */
export function revokeMilestone(milestoneId, reason = '') {
  const s = ensurePhase2();
  const m = s.milestones.find(x => x.id === milestoneId);
  if (!m) return mockResponse(null);
  m.status = 'in_progress';
  m.actualDate = '';
  m.revokeReason = reason;
  saveStore();
  return mockResponse(m);
}

/**
 * 撤销项目验收（误操作救济）
 */
export function revokeAcceptance(acceptanceId, reason = '') {
  const s = ensurePhase2();
  const idx = s.acceptances.findIndex(x => x.id === acceptanceId);
  if (idx < 0) return mockResponse(null);
  const acc = s.acceptances[idx];
  acc.revoked = true;
  acc.revokeReason = reason;
  acc.revokeTime = now();
  // 项目状态回退（若仍在验收中）
  const project = s.projects.find(p => p.id === acc.projectId);
  if (project && project.status === 'completed') {
    project.status = 'pending_acceptance';
  }
  saveStore();
  return mockResponse(acc);
}

/**
 * 查询项目验收历史（含已撤销）
 */
export function getAcceptanceHistory(projectId) {
  const s = ensurePhase2();
  const list = s.acceptances.filter(a => a.projectId === projectId).sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  return mockResponse(list);
}

/**
 * 计划作废：把 active 改为 archived，已生成的 pending_dispatch 任务一并取消
 */
export function archivePlan(planId, reason = '') {
  const s = ensurePhase2();
  const plan = s.plans.find(x => x.id === planId);
  if (!plan) return mockResponse(null);
  plan.status = 'archived';
  plan.archiveReason = reason;
  plan.archiveTime = now();
  // 关联的待派发任务标记为 cancelled
  s.tasks
    .filter(t => t.planId === planId && t.status === 'pending_dispatch')
    .forEach(t => {
      t.status = 'cancelled';
      t.cancelReason = `计划作废：${reason}`;
    });
  saveStore();
  return mockResponse(plan);
}

/**
 * 任务取消（仅允许在派发后、未提交审核前）
 */
export function cancelTask(taskId, reason = '') {
  const s = ensurePhase2();
  const t = s.tasks.find(x => x.id === taskId);
  if (!t) return mockResponse(null);
  if (['completed', 'pending_review'].includes(t.status)) {
    return Promise.reject(new Error('已完成或待审核的任务不可取消'));
  }
  t.status = 'cancelled';
  t.cancelReason = reason;
  t.cancelTime = now();
  saveStore();
  return mockResponse(t);
}

export function submitAcceptance(row) {
  const s = ensurePhase2();
  const item = {
    id: genId('acc'),
    code: genCode('acceptance'),
    projectId: row.projectId,
    acceptanceType: row.acceptanceType || 'final',
    acceptanceDate: row.acceptanceDate || today(),
    conclusion: row.conclusion || 'passed',
    opinion: row.opinion || '',
    files: row.files || [],
    revoked: false,
    createTime: now(),
  };
  s.acceptances.push(item);
  const project = s.projects.find(x => x.id === row.projectId);
  if (project) {
    if (row.conclusion === 'passed' && row.acceptanceType !== 'interim') {
      project.status = 'completed';
    } else if (row.conclusion === 'conditional') {
      // 有条件通过：进入待验收(整改后复验)
      project.status = 'pending_acceptance';
      createAcceptanceRectifications(s, project, item, row.opinion);
    } else if (row.conclusion === 'failed') {
      // 不通过：项目回到进行中,触发整改
      project.status = 'ongoing';
      createAcceptanceRectifications(s, project, item, row.opinion);
    }
  }
  saveStore();
  return mockResponse(item);
}

export function getTaskStats(projectId) {
  const s = ensurePhase2();
  const tasks = s.tasks.filter(t => t.projectId === projectId).map(withTaskDisplayStatus);
  const doneCount = tasks.filter(t => t.status === 'completed').length;
  return {
    doneCount,
    totalCount: tasks.length,
    todoCount: tasks.length - doneCount,
    progress: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0,
  };
}

export function getProjectDetailAggregated(projectId) {
  const s = ensurePhase2();
  const project = syncProjectContracts(
    s.projects.find(p => p.id === projectId),
    s,
  );
  if (!project) return null;
  const contracts = project.contracts || [];
  const contract = contracts[0] || s.contracts.find(c => c.id === project.contractId);
  const tasks = s.tasks.filter(t => t.projectId === projectId && t.status !== 'cancelled').map(withTaskDisplayStatus);
  const contractAmount = contracts.reduce((sum, item) => sum + (Number(item.contractAmount) || 0), 0);
  return {
    ...project,
    pomsStatus: project.status,
    customName: project.customerName,
    customerName: project.customerName,
    projectAmount: contractAmount || project.budget,
    budget: project.budget,
    deliveryDate: project.planEndDate,
    projectManagerName: project.projectManagerName,
    milestones: s.milestones.filter(m => m.projectId === projectId),
    projectRoles: s.projectRoles.filter(r => r.projectId === projectId),
    proposal: s.proposals.find(p => p.projectId === projectId),
    plan: s.plans.find(p => p.projectId === projectId && p.status === 'active') || s.plans.find(p => p.projectId === projectId),
    plans: s.plans.filter(p => p.projectId === projectId),
    tasks,
    deliverables: s.deliverables.filter(d => d.projectId === projectId),
    acceptance: (s.acceptances.filter(a => a.projectId === projectId && !a.revoked) || [])[0] || null,
    acceptanceHistory: s.acceptances.filter(a => a.projectId === projectId).sort((a, b) => (b.createTime || '').localeCompare(a.createTime || '')),
    rectifications: s.rectifications.filter(r => r.projectId === projectId),
    contract,
    contracts,
    attachments: project.attachments || { technicalFiles: [], qualificationFiles: [], otherFiles: [] },
    taskStats: getTaskStats(projectId),
  };
}

export function getAcceptanceListPage(current = 1, size = 10, params = {}) {
  const s = ensurePhase2();
  // 默认隐藏已撤销（可通过 params.includeRevoked=1 查看）
  const includeRevoked = String(params.includeRevoked) === '1';
  delete params.includeRevoked;
  let list = [...s.acceptances].filter(a => includeRevoked || !a.revoked);
  s.projects
    .filter(p => ['pending_acceptance', 'completed'].includes(p.status))
    .forEach(p => {
      if (!list.find(a => a.projectId === p.id)) {
        list.push({
          id: `pending-${p.id}`,
          projectId: p.id,
          code: '-',
          acceptanceType: 'final',
          acceptanceDate: '',
          conclusion: p.status === 'completed' ? 'passed' : '',
          pending: p.status === 'pending_acceptance',
          createTime: p.createTime || '',
        });
      }
    });
  list = enrichProjectMeta(list, s);
  if (params.projectId) list = list.filter(i => i.projectId === params.projectId);
  list = filterList(list, params);
  list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
  return mockResponse(paginate(list, current, size));
}

export function createCrudApi(collectionKey) {
  return {
    getPage(current, size, params = {}) {
      const s = ensurePhase2();
      let list = [...(s[collectionKey] || [])];
      if (params.projectId) list = list.filter(i => i.projectId === params.projectId);
      if (params.taskId) list = list.filter(i => i.taskId === params.taskId);
      if (collectionKey === 'tasks') list = list.map(withTaskDisplayStatus);
      if (params.status) list = list.filter(i => i.status === params.status);
      if (params.auditStatus) list = list.filter(i => i.auditStatus === params.auditStatus);
      list = enrichProjectMeta(list, s);
      if (collectionKey === 'tasks') {
        list = list.map(t => ({
          ...t,
          deliverableCount: s.deliverables.filter(d => d.taskId === t.id).length,
        }));
      }
      list = filterList(list, params);
      list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
      return mockResponse(paginate(list, current, size));
    },
    getDetail(id) {
      const s = ensurePhase2();
      return mockResponse((s[collectionKey] || []).find(i => i.id === id) || null);
    },
    add(row) {
      const s = ensurePhase2();
      const item = { ...row, id: row.id || genId(collectionKey.slice(0, 4)), createTime: row.createTime || now() };
      s[collectionKey].unshift(item);
      saveStore();
      return mockResponse(item);
    },
    update(row) {
      const s = ensurePhase2();
      const idx = (s[collectionKey] || []).findIndex(i => i.id === row.id);
      if (idx >= 0) {
        s[collectionKey][idx] = { ...s[collectionKey][idx], ...row };
        saveStore();
        return mockResponse(s[collectionKey][idx]);
      }
      return mockResponse(null);
    },
    remove(ids) {
      const s = ensurePhase2();
      const idArr = String(ids).split(',');
      s[collectionKey] = (s[collectionKey] || []).filter(i => !idArr.includes(i.id));
      saveStore();
      return mockResponse(true);
    },
  };
}

export function resetPhase2DemoData() {
  const s = loadStore();
  delete s._phase2Seeded;
  ['projectRoles', 'proposals', 'plans', 'tasks', 'deliverables', 'milestones', 'resultReviews', 'rectifications', 'acceptances'].forEach(k => {
    delete s[k];
  });
  saveStore();
  ensurePhase2();
}

export { mockResponse, ensurePhase2 as loadPhase2Store };
