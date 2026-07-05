import { loadStore } from '@/api/poms/phase1/mockStore';
import { ensurePhase2 } from '@/api/poms/phase2/phase2Store';
import { labelOf, TASK_STATUS } from '../option/dict';

function taskStatusToGantt(status) {
  const map = {
    pending_dispatch: { status: '待派发', statusCode: '10', progress: 0 },
    dispatched: { status: '已派发', statusCode: '10', progress: 0.1 },
    in_progress: { status: '进行中', statusCode: '10', progress: 0.5 },
    pending_review: { status: '待审核', statusCode: '10', progress: 0.9 },
    completed: { status: '已完成', statusCode: '20', progress: 1 },
    overdue: { status: '已延期', statusCode: '30', progress: 0.5 },
  };
  return map[status] || { status: labelOf(TASK_STATUS, status), statusCode: '10', progress: 0 };
}

function normalizeTaskForGantt(task) {
  if (!task?.planEndDate) return task;
  if (['completed', 'cancelled'].includes(task.status)) return task;
  const todayKey = new Date().toISOString().slice(0, 10);
  if (task.planEndDate >= todayKey) return task;
  return { ...task, rawStatus: task.status, status: 'overdue', overdue: true };
}

function calcProgressFromTasks(tasks) {
  if (!tasks.length) return 0;
  const sum = tasks.reduce((acc, t) => acc + (taskStatusToGantt(t.status).progress || 0), 0);
  return sum / tasks.length;
}

function aggregateStatus(tasks) {
  if (!tasks.length) return { status: '未开始', statusCode: '10', progress: 0 };
  if (tasks.every(t => t.status === 'completed')) {
    return { status: '已完成', statusCode: '20', progress: 1 };
  }
  if (tasks.some(t => t.status === 'overdue')) {
    return { status: '已延期', statusCode: '30', progress: calcProgressFromTasks(tasks) };
  }
  return { status: '进行中', statusCode: '10', progress: calcProgressFromTasks(tasks) };
}

function buildBar(id, type, startDate, endDate, extra = {}) {
  return {
    id,
    type,
    startDate: startDate || '',
    endDate: endDate || '',
    overdue: !!extra.overdue,
    percent: extra.percent,
  };
}

function buildTaskNode(planTask, runtimeTask, projectId) {
  const displayTask = runtimeTask ? normalizeTaskForGantt(runtimeTask) : null;
  const gantt = displayTask ? taskStatusToGantt(displayTask.status) : { status: '计划中', statusCode: '10', progress: 0 };
  const planStart = displayTask?.planStartDate || planTask?.planStartDate || '';
  const planEnd = displayTask?.planEndDate || planTask?.planEndDate || '';
  const name = displayTask?.taskName || planTask?.name || '';
  const owner = displayTask?.assigneeName || planTask?.assigneeName || '';
  const actualStart = displayTask?.actualStartDate || '';
  const actualEnd = displayTask?.actualEndDate || '';
  return {
    id: displayTask?.id || `plan-task-${projectId}-${name}`,
    code: displayTask?.code || '',
    projectId,
    type: 'step',
    name,
    owner,
    status: gantt.status,
    rawStatus: displayTask?.rawStatus || displayTask?.status || 'planned',
    statusCode: gantt.statusCode,
    planStart,
    planEnd,
    progress: gantt.progress,
    bars: [buildBar(`bar-task-${displayTask?.id || name}`, 'task', actualStart || planStart, actualEnd || planEnd, { overdue: gantt.statusCode === '30', percent: gantt.progress * 100 })],
    children: [],
  };
}

function buildPhaseNode(phase, plan, runtimeTasks) {
  const planTasks = (plan.tasks || []).filter(t => t.phaseId === phase.id);
  const phaseRuntime = runtimeTasks.filter(t => t.phaseId === phase.id);
  let children;
  if (plan.status === 'active' && phaseRuntime.length) {
    children = phaseRuntime.map(rt => {
      const pt = planTasks.find(x => x.name === rt.taskName);
      return buildTaskNode(pt || rt, rt, plan.projectId);
    });
  } else {
    children = planTasks.map(pt => buildTaskNode(pt, null, plan.projectId));
  }
  const agg = aggregateStatus(phaseRuntime.length ? phaseRuntime : planTasks.map(() => ({ status: 'pending_dispatch' })));
  return {
    id: `${plan.id}-${phase.id}`,
    code: phase.id,
    projectId: plan.projectId,
    type: 'workOrder',
    name: phase.name,
    owner: '',
    status: agg.status,
    statusCode: agg.statusCode,
    planStart: phase.startDate,
    planEnd: phase.endDate,
    progress: agg.progress,
    bars: [buildBar(`bar-phase-${phase.id}`, 'order', phase.startDate, phase.endDate)],
    children,
  };
}

function buildPlanNode(plan, project, allRuntimeTasks) {
  const runtimeTasks = allRuntimeTasks.filter(t => t.planId === plan.id);
  const children = (plan.phases || []).map(ph => buildPhaseNode(ph, plan, runtimeTasks));
  const agg = plan.status === 'active' ? aggregateStatus(runtimeTasks) : { status: plan.status === 'active' ? '已生效' : '草稿', statusCode: '10', progress: 0 };
  return {
    id: plan.id,
    code: plan.version,
    projectId: project.id,
    type: 'order',
    name: `计划 ${plan.version}`,
    owner: project.projectManagerName || '',
    status: agg.status === '未开始' ? (plan.status === 'active' ? '已生效' : '草稿') : agg.status,
    statusCode: agg.statusCode,
    planStart: plan.planStartDate,
    planEnd: plan.planEndDate,
    progress: agg.progress,
    bars: [buildBar(`bar-plan-${plan.id}`, 'order', plan.planStartDate, plan.planEndDate)],
    children,
  };
}

function buildProjectNode(project, plans, allTasks) {
  const projectPlans = plans.filter(p => p.projectId === project.id);
  const projectTasks = allTasks.filter(t => t.projectId === project.id);
  const planNodes = projectPlans.map(p => buildPlanNode(p, project, projectTasks));
  const agg = aggregateStatus(projectTasks);
  return {
    id: project.id,
    code: project.code,
    projectId: project.id,
    type: 'project',
    name: project.projectName,
    owner: project.projectManagerName || '',
    status: agg.status,
    statusCode: agg.statusCode,
    planStart: project.planStartDate,
    planEnd: project.planEndDate,
    progress: agg.progress,
    bars: [buildBar(`bar-proj-${project.id}`, 'project', project.planStartDate, project.planEndDate)],
    children: planNodes,
  };
}

/** 将 phase2 mock 数据转为甘特树（项目 → 计划 → 阶段 → 任务） */
export function buildGanttTree(params = {}) {
  const s = ensurePhase2();
  const store = loadStore();
  const projects = store.projects || [];
  const { projectId, planId } = params;

  let targetProjects = [...projects];
  if (projectId) {
    targetProjects = targetProjects.filter(p => String(p.id) === String(projectId));
  }

  const plans = s.plans || [];
  const tasks = s.tasks || [];

  let tree = targetProjects.map(p => buildProjectNode(p, plans, tasks)).filter(node => node.children.length > 0 || !projectId);

  if (planId) {
    tree = tree
      .map(proj => ({
        ...proj,
        children: (proj.children || []).filter(plan => String(plan.id) === String(planId)),
      }))
      .filter(proj => proj.children.length > 0);
  }

  return tree;
}

/** 获取某项目下的计划选项（甘特页筛选） */
export function getPlanOptions(projectId) {
  if (!projectId) return [];
  const s = ensurePhase2();
  return (s.plans || []).filter(p => String(p.projectId) === String(projectId)).map(p => ({ id: p.id, label: `${p.version} (${p.status === 'active' ? '已生效' : '草稿'})` }));
}
