import { buildGanttTree, getPlanOptions } from '@/views/poms/phase2/utils/ganttAdapter';

function mockResponse(data) {
  return Promise.resolve({ data: { code: 200, success: true, data } });
}

export function getGanttTree(params = {}) {
  return mockResponse(buildGanttTree(params));
}

export function getGanttPlanOptions(projectId) {
  return mockResponse(getPlanOptions(projectId));
}
