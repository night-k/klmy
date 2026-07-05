<template>
  <basic-container>
    <div class="gantt-page">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="toolbar-time">
            <i class="fas fa-clock" aria-hidden="true" />
            当前时间：{{ currentDate }}
          </div>
          <el-select v-model="query.projectId" class="toolbar-select" placeholder="全部项目" @change="onProjectChange">
            <el-option label="全部项目" value="" />
            <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-select v-model="query.planId" class="toolbar-select" placeholder="全部计划" :disabled="!query.projectId" clearable @change="fetchTree">
            <el-option label="全部计划" value="" />
            <el-option v-for="item in planOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
          <el-select v-model="query.statusCode" class="toolbar-select status-select" placeholder="全部状态">
            <el-option label="全部状态" value="" />
            <el-option v-for="item in statusOptions" :key="item.code" :label="item.label" :value="item.code" />
          </el-select>
          <el-button class="btn-ghost" @click="resetView">重置视图</el-button>
        </div>
        <div class="toolbar-right">
          <el-button class="btn-ghost" @click="backToToday(false)">今天</el-button>
          <el-segmented v-model="timeScale" :options="timeScaleOptions" class="time-scale" @change="handleTimeScaleChange" />
        </div>
      </div>

      <div class="gantt-board">
        <div class="left-panel">
          <div class="left-header left-header-main">
            <span class="name-col">名称</span>
            <span class="owner-col">负责人</span>
            <span class="status-col">状态</span>
          </div>
          <div class="left-body">
            <div
              v-for="item in displayRows"
              :key="item.id"
              class="left-row"
              :class="{ active: activeRow && activeRow.id === item.id, 'is-filter-hit': isStatusHit(item) }"
              @click="selectRow(item)"
              @dblclick="openFullInfo"
            >
              <span class="name-col tree-name" :style="{ paddingLeft: `${item.level * 16 + 4}px` }" :title="item.name">
                <button v-if="hasChildren(item)" class="expand-btn" @click.stop="toggleExpand(item)">
                  <i :class="item.expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" aria-hidden="true" />
                </button>
                <span v-else class="expand-placeholder" />
                <i :class="treeTypeIcon(item.type)" class="tree-type-icon" aria-hidden="true" />
                <span class="name-text">{{ item.name }}</span>
              </span>
              <span class="owner-col">{{ item.owner }}</span>
              <span class="status-col">
                <el-tag size="small" :type="statusTagType(item.status, item.statusCode)" disable-transitions>
                  {{ item.status }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <div ref="timelineWrap" class="timeline-panel" @scroll="onTimelineScroll">
          <div class="timeline-header">
            <div class="timeline-month-row" :style="timelineWidthStyle">
              <div v-for="segment in monthSegments" :key="segment.key" class="timeline-month-cell" :style="{ width: `${segment.span * cellWidth}px` }">
                {{ segment.label }}
              </div>
            </div>
            <div class="timeline-scale" :style="timelineWidthStyle">
              <div v-for="day in days" :key="day.key" class="timeline-day" :class="{ 'is-today': day.dateKey === todayDateKey }" :style="{ width: `${cellWidth}px` }">
                <div class="timeline-day-date">{{ day.dateLabel }}</div>
                <div class="timeline-day-week">{{ day.weekLabel }}</div>
              </div>
            </div>
          </div>
          <div class="timeline-body">
            <div v-if="todayColumnStyle" class="today-column-highlight" :style="todayColumnStyle" />
            <div v-if="todayColumnLineStyle" class="today-column-line" :style="todayColumnLineStyle" />
            <div v-for="item in displayRows" :key="`bar-${item.id}`" class="timeline-row" :style="timelineWidthStyle">
              <div class="timeline-grid">
                <div v-for="day in days" :key="`${item.id}-${day.value}`" class="timeline-cell" :class="{ 'is-today': day.dateKey === todayDateKey }" :style="{ width: `${cellWidth}px` }" />
              </div>
              <div class="bar-layer">
                <div v-for="bar in item.bars" :key="bar.id" class="gantt-bar" :class="[`gantt-bar--${bar.type}`, { 'is-overdue': bar.overdue || item.statusCode === '30' }]" :style="barStyle(bar)">
                  <i :class="barIconClass(bar.type)" aria-hidden="true" />
                  <span class="bar-percent">{{ getBarPercent(item, bar) }}%</span>
                  <span v-if="bar.label">{{ bar.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref="floatingScrollbar" class="floating-scrollbar" @scroll="onFloatingScroll">
        <div class="floating-scrollbar-inner" :style="{ width: `${timelineContentWidth}px` }" />
      </div>
    </div>

    <el-dialog v-model="detailVisible" :title="detailDialogTitle" width="960px" top="4vh" append-to-body destroy-on-close class="gantt-detail-dialog">
      <div v-if="activeRow" class="detail-content">
        <div class="detail-grid">
          <div v-if="showDetailCode" class="detail-card">
            <div class="detail-card-label">编号</div>
            <div class="detail-card-value">{{ detailCode }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">负责人</div>
            <div class="detail-card-value">{{ displayText(activeRow.owner) }}</div>
          </div>
        </div>

        <div class="detail-block-title">计划时间</div>
        <div class="detail-grid">
          <div class="detail-card">
            <div class="detail-card-label">计划开始</div>
            <div class="detail-card-value">{{ displayText(activeRow.planStart) }}</div>
          </div>
          <div class="detail-card">
            <div class="detail-card-label">计划结束</div>
            <div class="detail-card-value with-tag">
              <span>{{ displayText(activeRow.planEnd) }}</span>
              <span v-if="isDetailOverdue" class="inline-status-tag is-overdue">已延期</span>
            </div>
          </div>
        </div>

        <div class="detail-block-title">实际时间</div>
        <div class="detail-grid">
          <div class="detail-card actual-start">
            <div class="detail-card-label">实际开始</div>
            <div class="detail-card-value">{{ detailActualStart }}</div>
          </div>
          <div class="detail-card" :class="detailActualEndClass">
            <div class="detail-card-label">实际结束</div>
            <div class="detail-card-value">{{ detailActualEnd }}</div>
          </div>
        </div>

        <div class="detail-progress-row">
          <span class="detail-progress-label">当前进度</span>
          <span class="detail-progress-value" :class="detailProgressClass"> {{ detailStatusText }} ({{ formatPercent(detailProgress) }}%) </span>
        </div>
        <div class="detail-progress-track">
          <span class="detail-progress-bar" :style="{ width: `${detailProgress}%` }" />
        </div>

        <div v-if="isDetailOverdue" class="detail-overdue-alert">
          <i class="fas fa-exclamation-circle" aria-hidden="true" />
          <span>该{{ detailEntityLabel }}已延期，计划结束时间为 {{ displayText(activeRow.planEnd) }}，请尽快处理</span>
        </div>

        <div v-if="detailChildren.length" class="detail-children">
          <div class="detail-block-title">{{ detailChildrenTitle }}（{{ detailChildren.length }}个）</div>
          <div class="detail-child-list">
            <div v-for="child in detailChildren" :key="child.id" class="detail-child-item" @click="selectRow(child)">
              <div class="detail-child-main">
                <div class="detail-child-top">
                  <i :class="treeTypeIcon(child.type)" class="detail-child-icon" aria-hidden="true" />
                  <div class="detail-child-name">{{ child.name || '-' }}</div>
                </div>
                <div class="detail-child-sub">
                  <span>计划：{{ childPlanRangeText(child) }}</span>
                  <span>实际：{{ childActualRangeText(child) }}</span>
                  <span>负责人：{{ displayText(child.owner) }}</span>
                </div>
              </div>
              <div class="detail-child-meta">
                <span class="detail-child-status" :class="statusClassName(child.statusCode)">
                  {{ child.status || detailStatusByCode(child.statusCode) }}
                </span>
                <span class="detail-child-progress" :class="statusClassName(child.statusCode)">{{ formatPercent(detailProgressValue(child)) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="detail-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button v-if="isTaskRow" plain @click="goTaskWithStatus">任务详情</el-button>
          <el-button v-if="isDispatchTask" type="warning" plain @click="goTaskWithStatus">去派发</el-button>
          <el-button v-if="isRunningTask" type="primary" plain @click="goTaskWithStatus">上传成果物</el-button>
          <el-button v-if="isReviewTask" type="success" plain @click="goTaskWithStatus">去审核</el-button>
          <el-button type="primary" @click="openFullInfo">查看完整信息</el-button>
        </div>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script>
import { getGanttTree, getGanttPlanOptions } from '@/api/poms/phase2/gantt';

const CELL_WIDTH = 34;
const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const STATUS_OPTIONS = [
  { code: '10', label: '进行中' },
  { code: '20', label: '已完成' },
  { code: '30', label: '已延期' },
];
const TIME_SCALE_OPTIONS = [
  { label: '日', value: 'day', displayDays: 20, cellMin: 28, cellMax: 90 },
  { label: '周', value: 'week', displayDays: 70, cellMin: 12, cellMax: 34 },
  { label: '月', value: 'month', displayDays: 180, cellMin: 6, cellMax: 18 },
];

function parseDateString(dateText) {
  if (!dateText) return null;
  const source = String(dateText).trim();
  if (!source) return null;
  // 兼容 yyyy-MM-dd / yyyy/MM/dd / yyyy-MM-dd HH:mm:ss / ISO 字符串
  if (/^\d{4}-\d{2}-\d{2}$/.test(source)) {
    return new Date(`${source}T00:00:00`);
  }
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(source)) {
    return new Date(`${source.replace(/\//g, '-')}T00:00:00`);
  }
  const normalized = source.includes(' ') && !source.includes('T') ? source.replace(' ', 'T') : source;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(baseDate, days) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next;
}

function buildDaysByRange(startDate, endDate) {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  if (!start || !end || start.getTime() > end.getTime()) return [];
  const result = [];
  let idx = 0;
  while (start.getTime() + idx * 86400000 <= end.getTime()) {
    const current = addDays(start, idx);
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const date = current.getDate();
    result.push({
      key: `${year}-${month}-${date}`,
      value: idx + 1,
      dateKey: formatDateKey(current),
      year,
      month,
      date,
      dateLabel: `${month}/${date}`,
      weekLabel: WEEK_LABELS[current.getDay()],
    });
    idx += 1;
  }
  return result;
}

function collectTimelineDateList(nodes, bucket = []) {
  if (!Array.isArray(nodes)) return bucket;
  nodes.forEach(node => {
    if (node.planStart) bucket.push(node.planStart);
    if (node.planEnd) bucket.push(node.planEnd);
    if (Array.isArray(node.bars)) {
      node.bars.forEach(bar => {
        if (bar.startDate) bucket.push(bar.startDate);
        if (bar.endDate) bucket.push(bar.endDate);
      });
    }
    collectTimelineDateList(node.children, bucket);
  });
  return bucket;
}

function normalizeBar(bar = {}, fallbackType) {
  const rawType = bar.type || fallbackType || 'project';
  const normalizedType = normalizeType(rawType, fallbackType || 'project');
  const normalizedStart = normalizeDateKey(bar.startDate);
  const normalizedEnd = normalizeDateKey(bar.endDate);
  return {
    id: bar.id || `${fallbackType || 'bar'}-${Math.random().toString(36).slice(2, 9)}`,
    type: normalizedType,
    label: bar.label || '',
    startDate: normalizedStart,
    endDate: normalizedEnd,
    overdue: !!bar.overdue,
    percent: Number.isFinite(Number(bar.percent)) ? Number(bar.percent) : undefined,
  };
}

function normalizeDateKey(dateText) {
  const date = parseDateString(dateText);
  return date ? formatDateKey(date) : '';
}

function normalizeType(rawType, fallbackType = 'project') {
  const source = String(rawType || fallbackType || 'project')
    .trim()
    .toLowerCase();
  if (['project'].includes(source)) return 'project';
  if (['workorder', 'work_order', 'order'].includes(source)) return 'order';
  if (['step', 'task', 'process', 'procedure'].includes(source)) return 'task';
  return String(rawType || fallbackType || 'project');
}

function normalizeNode(node = {}, level = 0, rootProjectId = '') {
  const projectId = node.projectId || rootProjectId || '';
  const type = node.type || (level === 0 ? 'project' : level === 1 ? 'workOrder' : 'step');
  const normalizedType = normalizeType(type, level === 0 ? 'project' : level === 1 ? 'order' : 'task');
  const children = Array.isArray(node.children) ? node.children : [];
  const normalizedCode = normalizedType === 'project' ? node.code || node.projectCode || node.projectNo || '' : node.code || node.workOrderCode || node.orderCode || node.taskCode || '';
  return {
    id: node.id || `${type}-${Math.random().toString(36).slice(2, 9)}`,
    sourceId: node.sourceId,
    code: normalizedCode,
    projectId,
    type: normalizedType,
    level,
    expanded: node.expanded !== false,
    name: node.name || '',
    owner: node.owner || '',
    status: node.status || '',
    rawStatus: node.rawStatus || '',
    statusCode: node.statusCode || '',
    planStart: normalizeDateKey(node.planStart),
    planEnd: normalizeDateKey(node.planEnd),
    progress: Number.isFinite(Number(node.progress)) ? Number(node.progress) : 0,
    desc: node.desc || '',
    bars: (Array.isArray(node.bars) ? node.bars : []).map(bar => normalizeBar(bar, type)),
    children: children.map(child => normalizeNode(child, level + 1, projectId)),
  };
}

function normalizeTree(tree = []) {
  return (Array.isArray(tree) ? tree : []).map(node => normalizeNode(node, 0, node.projectId || ''));
}

function extractTreeData(raw) {
  const candidates = [raw, raw?.data, raw?.data?.data, raw?.records, raw?.data?.records, raw?.data?.data?.records];
  const hit = candidates.find(item => Array.isArray(item));
  return Array.isArray(hit) ? hit : [];
}

export default {
  name: 'PomsPhase2Gantt',
  data() {
    const today = new Date();
    return {
      currentDate: formatDateKey(today),
      days: buildDaysByRange(formatDateKey(addDays(today, -30)), formatDateKey(addDays(today, 365))),
      statusOptions: STATUS_OPTIONS,
      timeScaleOptions: TIME_SCALE_OPTIONS.map(({ label, value }) => ({ label, value })),
      timeScale: 'day',
      cellWidth: CELL_WIDTH,
      query: {
        projectId: '',
        planId: '',
        statusCode: '',
      },
      planOptions: [],
      projectTree: [],
      detailVisible: false,
      activeRow: null,
      loading: false,
      syncingScrollFromTimeline: false,
      syncingScrollFromFloating: false,
    };
  },
  computed: {
    todayDateKey() {
      return formatDateKey(new Date());
    },
    timelineWidthStyle() {
      return {
        minWidth: `${this.timelineContentWidth}px`,
      };
    },
    timelineContentWidth() {
      return this.days.length * this.cellWidth;
    },
    dayIndexMap() {
      const map = {};
      this.days.forEach((day, index) => {
        map[day.dateKey] = index;
      });
      return map;
    },
    todayColumnStyle() {
      const index = this.dayIndexMap[this.todayDateKey];
      if (typeof index !== 'number') return null;
      return {
        left: `${index * this.cellWidth}px`,
        width: `${this.cellWidth}px`,
      };
    },
    todayColumnLineStyle() {
      const index = this.dayIndexMap[this.todayDateKey];
      if (typeof index !== 'number') return null;
      const centerOffset = Math.floor(this.cellWidth / 2);
      return {
        left: `${index * this.cellWidth + centerOffset}px`,
      };
    },
    monthSegments() {
      const segments = [];
      this.days.forEach((day, idx) => {
        const last = segments[segments.length - 1];
        const key = `${day.year}-${day.month}`;
        if (!last || last.key !== key) {
          const prevYear = last ? Number(last.key.split('-')[0]) : null;
          const needYear = prevYear !== day.year;
          segments.push({
            key,
            span: 1,
            label: needYear ? `${day.year}年${day.month}月` : `${day.month}月`,
          });
        } else {
          last.span += 1;
        }
        if (idx === 0 && segments[0]) {
          segments[0].label = `${day.year}年${day.month}月`;
        }
      });
      return segments;
    },
    projectOptions() {
      return this.projectTree.map(item => ({ id: item.projectId, name: item.name }));
    },
    displayRows() {
      const pid = this.query.projectId;
      const roots = pid === '' || pid === null || pid === undefined ? this.projectTree : this.projectTree.filter(item => String(item.projectId) === String(pid));
      const statusFilter = this.query.statusCode;
      const rows = [];
      const hasHit = node => {
        if (!statusFilter) return true;
        if (node.statusCode === statusFilter) return true;
        return (node.children || []).some(hasHit);
      };
      const pushNode = node => {
        if (statusFilter && !hasHit(node)) return;
        node.filterHit = !statusFilter || node.statusCode === statusFilter;
        rows.push(node);
        if (node.expanded && this.hasChildren(node)) {
          node.children.forEach(child => {
            if (!statusFilter || hasHit(child)) pushNode(child);
          });
        }
      };
      roots.forEach(pushNode);
      return rows;
    },
    detailDialogTitle() {
      if (!this.activeRow) return '详情';
      return `${this.detailEntityLabel}详情 - ${this.activeRow.name || '-'}`;
    },
    detailEntityLabel() {
      if (!this.activeRow) return '';
      if (this.activeRow.type === 'project') return '项目';
      if (this.activeRow.type === 'order') return '任务';
      return '工单';
    },
    detailCode() {
      if (!this.activeRow) return '--';
      if (this.activeRow.type === 'project') {
        return this.activeRow.code || '--';
      }
      if (this.activeRow.type === 'order') {
        return this.activeRow.code || this.activeRow.sourceId || '--';
      }
      return '--';
    },
    showDetailCode() {
      if (!this.activeRow) return false;
      return this.activeRow.type === 'project' || this.activeRow.type === 'order';
    },
    detailPrimaryBar() {
      if (!this.activeRow || !Array.isArray(this.activeRow.bars)) return null;
      return this.activeRow.bars.find(item => item.startDate || item.endDate) || this.activeRow.bars[0] || null;
    },
    detailActualStart() {
      return this.displayText(this.detailPrimaryBar?.startDate);
    },
    detailActualEnd() {
      if (!this.activeRow) return '--';
      if (this.activeRow.statusCode === '20') return this.displayText(this.detailPrimaryBar?.endDate);
      if (this.activeRow.statusCode === '10' || this.activeRow.statusCode === '30') return '进行中';
      return this.displayText(this.detailPrimaryBar?.endDate);
    },
    detailActualEndClass() {
      if (!this.activeRow) return '';
      if (this.activeRow.statusCode === '20') return 'actual-end success';
      if (this.activeRow.statusCode === '30') return 'actual-end danger';
      return 'actual-end info';
    },
    detailStatusText() {
      if (!this.activeRow) return '';
      return this.activeRow.status || this.detailStatusByCode(this.activeRow.statusCode);
    },
    detailProgress() {
      return this.detailProgressValue(this.activeRow);
    },
    detailProgressClass() {
      if (!this.activeRow) return '';
      return this.statusClassName(this.activeRow.statusCode);
    },
    isDetailOverdue() {
      if (!this.activeRow) return false;
      return this.activeRow.statusCode === '30' || this.activeRow.status === '已延期';
    },
    detailChildren() {
      if (!this.activeRow || !Array.isArray(this.activeRow.children)) return [];
      return this.activeRow.children;
    },
    detailChildrenTitle() {
      if (!this.activeRow) return '下级列表';
      if (this.activeRow.type === 'project') return '下级任务';
      if (this.activeRow.type === 'order') return '下级工单';
      return '下级明细';
    },
    isTaskRow() {
      return this.activeRow?.type === 'task' && this.activeRow.id && !String(this.activeRow.id).startsWith('plan-task-');
    },
    isDispatchTask() {
      return this.isTaskRow && this.activeRow.rawStatus === 'pending_dispatch';
    },
    isRunningTask() {
      return this.isTaskRow && ['dispatched', 'in_progress'].includes(this.activeRow.rawStatus);
    },
    isReviewTask() {
      return this.isTaskRow && this.activeRow.rawStatus === 'pending_review';
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateScaleByViewport, { passive: true });
    const { projectId, planId } = this.$route.query;
    if (projectId) this.query.projectId = String(projectId);
    if (planId) this.query.planId = String(planId);
    this.loadPlanOptions().then(() => this.fetchTree());
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateScaleByViewport);
  },
  methods: {
    async loadPlanOptions() {
      if (!this.query.projectId) {
        this.planOptions = [];
        return;
      }
      const res = await getGanttPlanOptions(this.query.projectId);
      this.planOptions = res.data.data || [];
    },
    onProjectChange() {
      this.query.planId = '';
      this.loadPlanOptions().then(() => this.fetchTree());
    },
    async fetchTree() {
      this.loading = true;
      try {
        const params = {};
        if (this.query.projectId) params.projectId = this.query.projectId;
        if (this.query.planId) params.planId = this.query.planId;
        const res = await getGanttTree(params);
        this.projectTree = normalizeTree(extractTreeData(res));
        this.rebuildTimelineByTree();
        this.updateScaleByViewport();
        this.$nextTick(() => {
          this.backToToday(false);
          this.syncFloatingWithTimeline();
        });
      } catch (error) {
        this.$message.error('甘特图数据加载失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },
    currentScaleConfig() {
      return TIME_SCALE_OPTIONS.find(item => item.value === this.timeScale) || TIME_SCALE_OPTIONS[0];
    },
    updateScaleByViewport() {
      const wrap = this.$refs.timelineWrap;
      if (!wrap || !wrap.clientWidth) return;
      const scale = this.currentScaleConfig();
      const displayDays = scale.displayDays;
      const dynamicWidth = wrap.clientWidth / displayDays;
      this.cellWidth = Math.max(scale.cellMin, Math.min(scale.cellMax, Math.round(dynamicWidth)));
    },
    handleTimeScaleChange() {
      this.updateScaleByViewport();
      this.$nextTick(() => {
        this.backToToday(false);
        this.syncFloatingWithTimeline();
      });
    },
    rebuildTimelineByTree() {
      const dateList = collectTimelineDateList(this.projectTree, []);
      const today = new Date();
      if (!dateList.length) {
        this.days = buildDaysByRange(formatDateKey(addDays(today, -30)), formatDateKey(addDays(today, 365)));
        return;
      }
      const dateValues = dateList
        .map(item => parseDateString(item))
        .filter(item => item instanceof Date && !Number.isNaN(item.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
      const minDate = dateValues[0] || addDays(today, -30);
      const maxDate = dateValues[dateValues.length - 1] || addDays(today, 30);
      // 时间轴范围既要覆盖业务数据，也要覆盖今天，才能保证“今天居中”可用。
      const dataRangeStart = addDays(minDate, -15);
      const dataRangeEnd = addDays(maxDate, 45);
      const todayRangeStart = addDays(today, -45);
      const todayRangeEnd = addDays(today, 45);
      const rangeStart = new Date(Math.min(dataRangeStart.getTime(), todayRangeStart.getTime()));
      const rangeEnd = new Date(Math.max(dataRangeEnd.getTime(), todayRangeEnd.getTime()));
      this.days = buildDaysByRange(formatDateKey(rangeStart), formatDateKey(rangeEnd));
    },
    hasChildren(node) {
      return Array.isArray(node.children) && node.children.length > 0;
    },
    toggleExpand(node) {
      node.expanded = !node.expanded;
    },
    treeTypeIcon(type) {
      if (type === 'project') return 'fas fa-folder-open';
      if (type === 'order') return 'fas fa-file-invoice';
      return 'fas fa-tasks';
    },
    statusTagType(status, statusCode) {
      if (statusCode === '20' || status === '已完成') return 'success';
      if (statusCode === '30' || status === '已延期') return 'danger';
      return 'warning';
    },
    isStatusHit(item) {
      return !!this.query.statusCode && item?.filterHit;
    },
    barIconClass(type) {
      if (type === 'project') return 'fas fa-folder-open';
      if (type === 'order') return 'fas fa-file-invoice';
      return 'fas fa-tasks';
    },
    barStyle(bar) {
      const totalDays = this.days.length;
      const startIdx = this.dayIndexMap[bar.startDate];
      const endIdx = this.dayIndexMap[bar.endDate];
      if (typeof startIdx !== 'number' || typeof endIdx !== 'number') {
        return { display: 'none' };
      }
      if (endIdx < 0 || startIdx > totalDays - 1) {
        return { display: 'none' };
      }
      const safeStart = Math.max(0, startIdx);
      const safeEnd = Math.min(totalDays - 1, endIdx);
      const left = safeStart * this.cellWidth;
      const width = Math.max((safeEnd - safeStart + 1) * this.cellWidth - 6, 8);
      return {
        left: `${left + 3}px`,
        width: `${width}px`,
      };
    },
    getBarPercent(item, bar) {
      if (typeof bar.percent === 'number') return Math.round(bar.percent * 100) / 100;
      return Math.round((item.progress || 0) * 100) / 100;
    },
    selectRow(row) {
      this.activeRow = row;
      this.detailVisible = true;
    },
    resetView() {
      this.query.projectId = '';
      this.query.planId = '';
      this.query.statusCode = '';
      this.planOptions = [];
      const expandAll = nodes => {
        nodes.forEach(node => {
          if (this.hasChildren(node)) {
            node.expanded = true;
            expandAll(node.children);
          }
        });
      };
      expandAll(this.projectTree);
      this.$nextTick(() => {
        this.backToToday();
      });
    },
    backToToday(smooth = true) {
      const timeline = this.$refs.timelineWrap;
      const floating = this.$refs.floatingScrollbar;
      const todayIndex = this.dayIndexMap[this.todayDateKey];
      if (!timeline || typeof todayIndex !== 'number') return;
      const maxT = Math.max(0, timeline.scrollWidth - timeline.clientWidth);
      const raw = todayIndex * this.cellWidth - timeline.clientWidth / 2 + this.cellWidth / 2;
      const targetLeft = Math.min(maxT, Math.max(0, raw));

      // 主时间轴与底部悬浮条共用一套横向偏移；只改一侧时，另一侧可能仍停在拖动后的位置，
      // 且程序化改 scrollLeft 不一定触发 scroll 同步。双写并短暂互斥，避免回环；悬浮条宽度可能不同，以 timeline 为准再对齐。
      const applyBothInstant = () => {
        this.syncingScrollFromTimeline = true;
        this.syncingScrollFromFloating = true;
        timeline.scrollLeft = targetLeft;
        if (floating) floating.scrollLeft = timeline.scrollLeft;
        requestAnimationFrame(() => {
          this.syncingScrollFromTimeline = false;
          this.syncingScrollFromFloating = false;
        });
      };

      if (smooth && timeline.scrollTo) {
        timeline.scrollTo({ left: targetLeft, behavior: 'smooth' });
        if (floating && floating.scrollTo) {
          floating.scrollTo({ left: targetLeft, behavior: 'smooth' });
        }
      } else {
        applyBothInstant();
      }
    },
    onTimelineScroll(event) {
      if (this.syncingScrollFromFloating) return;
      const floating = this.$refs.floatingScrollbar;
      if (!floating) return;
      const left = event?.target?.scrollLeft || 0;
      this.syncingScrollFromTimeline = true;
      floating.scrollLeft = left;
      this.syncingScrollFromTimeline = false;
    },
    onFloatingScroll(event) {
      if (this.syncingScrollFromTimeline) return;
      const timeline = this.$refs.timelineWrap;
      if (!timeline) return;
      const left = event?.target?.scrollLeft || 0;
      this.syncingScrollFromFloating = true;
      timeline.scrollLeft = left;
      this.syncingScrollFromFloating = false;
    },
    syncFloatingWithTimeline() {
      const timeline = this.$refs.timelineWrap;
      const floating = this.$refs.floatingScrollbar;
      if (!timeline || !floating) return;
      floating.scrollLeft = timeline.scrollLeft;
    },
    displayText(value) {
      return value ? String(value) : '--';
    },
    detailStatusByCode(code) {
      if (code === '20') return '已完成';
      if (code === '30') return '已延期';
      return '进行中';
    },
    childPlanRangeText(row) {
      const start = this.displayText(row?.planStart);
      const end = this.displayText(row?.planEnd);
      return `${start} 至 ${end}`;
    },
    childActualRangeText(row) {
      if (!row) return '--';
      const bar = Array.isArray(row.bars) && row.bars.length ? row.bars[0] : null;
      const start = this.displayText(bar?.startDate);
      if (row.statusCode === '20') {
        return `${start} 至 ${this.displayText(bar?.endDate)}`;
      }
      return `${start} 至 进行中`;
    },
    detailProgressValue(row) {
      if (!row) return 0;
      const raw = Number(row.progress);
      if (!Number.isFinite(raw)) return 0;
      const percent = raw <= 1 ? raw * 100 : raw;
      const fixed = Number(percent.toFixed(2));
      return Math.max(0, Math.min(100, fixed));
    },
    formatPercent(value) {
      const num = Number(value);
      if (!Number.isFinite(num)) return '0.00';
      return num.toFixed(2);
    },
    statusClassName(code) {
      if (code === '20') return 'is-success';
      if (code === '30') return 'is-danger';
      return 'is-warning';
    },
    findOrderCodeForTask(taskNode) {
      if (!taskNode || !taskNode.id) return '';
      const walk = (nodes, parentOrderCode = '') => {
        if (!Array.isArray(nodes) || !nodes.length) return '';
        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          const currentOrderCode = node.type === 'order' ? node.code || '' : parentOrderCode;
          if (node.id === taskNode.id) {
            return currentOrderCode;
          }
          const hit = walk(node.children, currentOrderCode);
          if (hit) return hit;
        }
        return '';
      };
      return walk(this.projectTree, '');
    },
    openFullInfo() {
      if (!this.activeRow) return;
      if (this.activeRow.type === 'project') {
        this.$router.push({
          path: `/poms/phase2/projectSpace/${this.activeRow.projectId}`,
        });
        return;
      }
      if (this.activeRow.type === 'order') {
        this.$router.push({
          path: '/poms/phase2/plan',
          query: { projectId: this.activeRow.projectId || '' },
        });
        return;
      }
      const taskId = this.activeRow.id;
      if (taskId && !String(taskId).startsWith('plan-task-')) {
        this.$router.push({
          path: '/poms/phase2/task',
          query: { taskId, status: this.activeRow.rawStatus || undefined },
        });
      } else {
        this.$message.info('该计划任务尚未生效，请先进入项目计划处理');
      }
    },
    goTaskWithStatus() {
      this.openFullInfo();
    },
  },
};
</script>

<style scoped lang="scss">
.gantt-page {
  background: #fff;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f6f8fb;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  color: #606266;
  font-size: 13px;
}

.toolbar-select {
  width: 180px;
}

.status-select {
  width: 140px;
}

.time-scale {
  min-width: 132px;
}

.btn-ghost {
  border-color: #dcdfe6;
  color: #606266;
}

.gantt-board {
  display: grid;
  grid-template-columns: 360px 1fr;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
}

.left-panel {
  border-right: 1px solid #ebeef5;
  background: #fff;
}

.left-header,
.left-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 0.9fr;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.left-header {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #f5f7fa;
  color: #303133;
  font-size: 12px;
  font-weight: 600;
  min-height: 56px;
  line-height: 56px;
}

.left-row {
  min-height: 48px;
}

.left-header-main {
  border-bottom: 1px solid #ebeef5;
}

.left-body .left-row {
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  font-size: 13px;
  color: #606266;

  &.active {
    background: #ecf5ff;
  }

  &.is-filter-hit {
    box-shadow: inset 3px 0 0 #409eff;
  }

  &:hover {
    background: #f5faff;
  }
}

.name-col {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-name {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.expand-btn {
  width: 18px;
  height: 18px;
  border: 0;
  padding: 0;
  margin-right: 2px;
  background: transparent;
  color: #909399;
  cursor: pointer;
}

.expand-placeholder {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 2px;
}

.tree-type-icon {
  width: 16px;
  margin-right: 6px;
  text-align: center;
  font-size: 12px;
}

.fa-folder-open.tree-type-icon {
  color: #409eff;
}

.fa-tasks.tree-type-icon {
  color: #67c23a;
}

.fa-file-invoice.tree-type-icon {
  color: #e6a23c;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-panel {
  overflow-x: auto;
  overflow-y: hidden;
  background: #fff;
}

.timeline-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: inset 0 -1px 0 #ebeef5;
}

.timeline-month-row {
  display: flex;
  height: 24px;
  align-items: center;
  border-bottom: 1px solid #f1f3f5;
  background: #fafafa;
}

.timeline-month-cell {
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-right: 1px solid #f1f3f5;
  font-size: 11px;
  color: #606266;
  white-space: nowrap;
}

.timeline-scale {
  display: flex;
  height: 32px;
}

.timeline-day {
  width: var(--cell-width, 34px);
  height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-right: 1px solid #f1f3f5;
}

.timeline-day-date {
  line-height: 1.05;
  font-size: 11px;
  color: #606266;
}

.timeline-day-week {
  margin-top: 2px;
  line-height: 1;
  font-size: 10px;
  color: #909399;
  transform: scale(0.9);
}

.timeline-day.is-today {
  background: linear-gradient(180deg, #e8f3ff 0%, #f3f9ff 100%);
  border-left: 1px solid #93c5fd;
  border-right: 1px solid #93c5fd;

  .timeline-day-date {
    color: #2563eb;
    font-weight: 700;
  }

  .timeline-day-week {
    color: #3b82f6;
  }
}

.timeline-cell {
  width: var(--cell-width, 34px);
  border-right: 1px solid #f7f8fa;
}

.timeline-cell.is-today {
  background: rgba(64, 158, 255, 0.1);
  border-left: 1px solid rgba(64, 158, 255, 0.35);
  border-right: 1px solid rgba(64, 158, 255, 0.35);
}

.timeline-body {
  position: relative;
}

.today-column-highlight {
  position: absolute;
  top: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.14) 0%, rgba(64, 158, 255, 0.08) 100%);
  border-left: 1px solid rgba(64, 158, 255, 0.3);
  border-right: 1px solid rgba(64, 158, 255, 0.3);
  pointer-events: none;
  z-index: 0;
}

.today-column-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 2px solid rgba(37, 99, 235, 0.45);
  pointer-events: none;
  z-index: 0;
}

.timeline-row {
  position: relative;
  height: 48px;
  border-bottom: 1px solid #f1f3f5;
  z-index: 1;
}

.bar-layer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 2;
}

.gantt-bar {
  position: absolute;
  top: 10px;
  height: 28px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  color: #fff;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  white-space: nowrap;

  &--project {
    background: #409eff;
  }

  &--task {
    background: #67c23a;
  }

  &--order {
    background: #e6a23c;
  }

  &.is-overdue {
    background: #f56c6c;
  }
}

.bar-percent {
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.floating-scrollbar {
  position: sticky;
  bottom: 8px;
  z-index: 20;
  margin-top: 8px;
  height: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
}

.floating-scrollbar-inner {
  height: 1px;
}

:deep(.gantt-detail-dialog .el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
}

:deep(.gantt-detail-dialog .el-dialog__body) {
  padding: 18px 20px 12px;
}

.detail-content {
  max-height: calc(86vh - 132px);
  overflow: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  border: 1px solid #e6edf5;
  border-radius: 8px;
  background: #f5f7fa;
  padding: 10px 12px;
}

.detail-card-label {
  margin-bottom: 2px;
  color: #9099a8;
  font-size: 13px;
}

.detail-card-value {
  color: #1f2d3d;
  font-size: 13px;
  line-height: 1.7;
  font-weight: 500;
}

.detail-card-value.with-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.inline-status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 18px;
  border-radius: 4px;

  &.is-overdue {
    color: #f56c6c;
    background: #ffecec;
  }
}

.detail-block-title {
  margin: 14px 0 8px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.detail-card.actual-start {
  border-color: #c7dfff;
  background: #f4f9ff;
}

.detail-card.actual-end.info {
  border-color: #c7dfff;
  background: #f4f9ff;

  .detail-card-label,
  .detail-card-value {
    color: #1d64f0;
  }
}

.detail-card.actual-end.success {
  border-color: #b4f1cd;
  background: #f0fff7;

  .detail-card-label,
  .detail-card-value {
    color: #00a854;
  }
}

.detail-card.actual-end.danger {
  border-color: #ffc8c8;
  background: #fff5f5;

  .detail-card-label,
  .detail-card-value {
    color: #f56c6c;
  }
}

.detail-progress-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.detail-progress-label {
  color: #303133;
  font-size: 16px;
}

.detail-progress-value {
  font-size: 16px;
  font-weight: 600;

  &.is-warning {
    color: #1d64f0;
  }

  &.is-success {
    color: #00a854;
  }

  &.is-danger {
    color: #f56c6c;
  }
}

.detail-progress-track {
  margin-top: 8px;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #edf2f8;
  overflow: hidden;
}

.detail-progress-bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #4aa6ff 0%, #1293ff 100%);
}

.detail-overdue-alert {
  margin-top: 12px;
  border-radius: 6px;
  border: 1px solid #ffe0e0;
  background: #fff7f7;
  color: #f56c6c;
  padding: 9px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.detail-children {
  margin-top: 12px;
  border-top: 1px solid #eef2f7;
}

.detail-child-list {
  max-height: 220px;
  overflow: auto;
  padding-right: 4px;
}

.detail-child-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;

  &:hover {
    border-color: #c5ddff;
    background: #f7fbff;
  }
}

.detail-child-main {
  min-width: 0;
  flex: 1;
}

.detail-child-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-child-icon {
  width: 14px;
  text-align: center;
}

.detail-child-icon.fa-folder-open {
  color: #409eff;
}

.detail-child-icon.fa-file-invoice {
  color: #e6a23c;
}

.detail-child-icon.fa-tasks {
  color: #67c23a;
}

.detail-child-name {
  color: #303133;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-child-sub {
  margin-top: 3px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #8a95a6;
  font-size: 12px;
  line-height: 1.45;
}

.detail-child-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.detail-child-status,
.detail-child-progress {
  font-size: 14px;
  font-weight: 600;
}

.detail-child-status.is-warning,
.detail-child-progress.is-warning {
  color: #1d64f0;
}

.detail-child-status.is-success,
.detail-child-progress.is-success {
  color: #00a854;
}

.detail-child-status.is-danger,
.detail-child-progress.is-danger {
  color: #f56c6c;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1280px) {
  .gantt-board {
    grid-template-columns: 320px 1fr;
  }
}
</style>
