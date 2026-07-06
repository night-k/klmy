<template>
  <basic-container v-loading="loading" class="poms-project-space">
    <div v-if="projectObj.id" class="project-space-page">
      <div v-if="!hideBreadcrumb" class="space-toolbar">
        <div class="space-breadcrumb">
          <span class="crumb-link" @click="$router.push('/poms/phase2/projectList')">项目列表</span>
          <el-icon class="space-crumb-arrow"><arrow-right /></el-icon>
          <span class="crumb-current">项目空间</span>
        </div>
      </div>

      <project-space-header
        :project="projectObj"
        :task-stats="taskStats"
        :quick-list="quickProjectList"
        :can-finish="canFinishProject"
        :current-role="currentRoleType"
        :role-options="ROLE_TYPE"
        @refresh="reload"
        @finish="handleFinish"
        @switch-project="switchProject"
        @go-expense="goExpense"
        @go-risk="goRisk"
        @go-overdue="goOverdue"
        @go-quality="goQuality"
        @role-change="currentRoleType = $event"
      />

      <project-space-tabs v-model="activeTab" :tabs="visibleTabs" />

      <div class="space-content">
        <module-shortcuts v-if="activeTab === 'basic'" :project-id="currentProjectId" class="space-shortcuts" />
        <div v-show="activeTab === 'basic'" class="tab-pane">
          <el-form v-if="editingAttrs" :model="attrForm" label-width="100px" class="attr-form">
            <el-form-item label="合作类型">
              <el-select v-model="attrForm.cooperationType" style="width: 100%">
                <el-option v-for="o in COOPERATION_TYPE" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="联营公司"><el-input v-model="attrForm.partnerCompany" /></el-form-item>
            <el-form-item label="服务类型">
              <el-select v-model="attrForm.serviceType" style="width: 100%">
                <el-option v-for="o in SERVICE_TYPE" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目描述"><el-input v-model="attrForm.description" type="textarea" :rows="3" /></el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAttrs">保存属性</el-button>
              <el-button @click="editingAttrs = false">取消</el-button>
            </el-form-item>
          </el-form>
          <template v-else>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="项目编号">{{ projectObj.code }}</el-descriptions-item>
              <el-descriptions-item label="关联合同">
                <div class="contract-links">
                  <el-tag v-for="item in projectContracts" :key="item.id" type="primary" effect="plain" class="contract-tag" @click="goContract(item.id)">
                    {{ item.code }}
                  </el-tag>
                  <span v-if="!projectContracts.length">-</span>
                  <el-button link type="primary" @click="openAttachContract">追加合同</el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ projectObj.customName }}</el-descriptions-item>
              <el-descriptions-item label="项目经理">{{ projectObj.projectManagerName }}</el-descriptions-item>
              <el-descriptions-item label="合作类型">{{ labelOf(COOPERATION_TYPE, projectObj.cooperationType) }}</el-descriptions-item>
              <el-descriptions-item label="联营公司">{{ projectObj.partnerCompany || '-' }}</el-descriptions-item>
              <el-descriptions-item label="服务类型">{{ labelOf(SERVICE_TYPE, projectObj.serviceType) }}</el-descriptions-item>
              <el-descriptions-item label="项目预算">¥{{ formatMoney(projectObj.budget) }}</el-descriptions-item>
              <el-descriptions-item label="计划周期">{{ projectObj.planStartDate }} ~ {{ projectObj.planEndDate }}</el-descriptions-item>
              <el-descriptions-item label="项目描述" :span="2">{{ projectObj.description || '-' }}</el-descriptions-item>
            </el-descriptions>
            <el-tooltip :content="permissionTips.attrs" :disabled="canEditProjectAttrs">
              <span>
                <el-button style="margin-top: 12px" type="primary" plain :disabled="!canEditProjectAttrs" @click="startEditAttrs">编辑项目属性</el-button>
              </span>
            </el-tooltip>
          </template>
        </div>

        <div v-show="activeTab === 'milestone'" class="tab-pane">
          <el-alert v-if="!canOperateQuality" type="info" show-icon :closable="false" title="当前角色只能查看里程碑，技术负责人或质检负责人可验收/撤销" style="margin-bottom: 12px" />
          <milestone-panel :milestones="projectObj.milestones || []" :show-actions="canOperateQuality" @pass="passMs" @revoke="revokeMs" @go-proposal="goProposal" />
        </div>

        <div v-show="activeTab === 'acceptance'" class="tab-pane">
          <acceptance-tab
            :project-id="currentProjectId"
            :can-submit="canSubmitAcceptance"
            :milestones="projectObj.milestones || []"
            :tasks="projectObj.tasks || []"
            :rectifications="projectObj.rectifications || []"
            :can-operate="canOperateQuality"
            @changed="reload"
          />
        </div>

        <div v-show="activeTab === 'team'" class="tab-pane">
          <el-table :data="teamRows" border>
            <el-table-column label="姓名" min-width="140">
              <template #default="{ row }">
                {{ row.userName || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="角色" width="140">
              <template #default="{ row }">
                {{ labelOf(ROLE_TYPE, row.roleType) }}
              </template>
            </el-table-column>
            <el-table-column label="加入日期" width="150">
              <template #default="{ row }">
                {{ row.joinDate || '-' }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!teamRows.length" description="开题报告审核通过后将自动同步团队（首次）">
            <el-button type="primary" link @click="goProposal">去填写开题报告</el-button>
          </el-empty>
        </div>

        <div v-show="activeTab === 'files'" class="tab-pane">
          <p class="files-hint">项目附件</p>
          <el-table :data="fileRows" border size="small" style="margin-bottom: 12px">
            <el-table-column prop="typeName" label="附件类型" width="140" />
            <el-table-column prop="name" label="文件名称" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" width="100" align="center">
              <template #default>
                <el-button link type="primary">预览</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-upload action="#" :auto-upload="false" drag>
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div>拖拽上传项目附件</div>
          </el-upload>
        </div>
      </div>
    </div>
    <el-empty v-else description="项目不存在" />

    <el-dialog v-model="contractAppendVisible" title="追加关联合同" width="560px" append-to-body>
      <el-select v-model="appendContractIds" multiple filterable clearable collapse-tags collapse-tags-tooltip placeholder="请选择要关联到当前项目的合同" style="width: 100%">
        <el-option v-for="item in availableContractOptions" :key="item.id" :label="`${item.code} - ${item.projectName}`" :value="item.id" />
      </el-select>
      <template #footer>
        <el-button @click="contractAppendVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!appendContractIds.length" @click="submitAttachContract">确认关联</el-button>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script>
import { COOPERATION_TYPE, SERVICE_TYPE, ROLE_TYPE, labelOf } from '../option/dict';
import { getPage, getDetail, getTaskStatsApi, finishMilestone, updateProject, finish, attachContracts } from '@/api/poms/phase2/projectAdapter';
import { loadStore } from '@/api/poms/phase1/mockStore';
import { revokeMilestone } from '@/api/poms/phase2/milestone';
import ModuleShortcuts from '../components/ModuleShortcuts.vue';
import MilestonePanel from '../components/MilestonePanel.vue';
import AcceptanceTab from '../components/tabs/AcceptanceTab.vue';
import ProjectSpaceHeader from './ProjectSpaceHeader.vue';
import ProjectSpaceTabs from './ProjectSpaceTabs.vue';
import { isProposalApproved, canAccept } from '../utils/projectFlow';
import { UploadFilled, ArrowRight } from '@element-plus/icons-vue';

export default {
  name: 'PomsPhase2ProjectSpace',
  components: {
    ModuleShortcuts,
    MilestonePanel,
    AcceptanceTab,
    ProjectSpaceHeader,
    ProjectSpaceTabs,
    UploadFilled,
    ArrowRight,
  },
  props: {
    projectId: { type: [String, Number], default: '' },
    hideBreadcrumb: { type: Boolean, default: false },
  },
  data() {
    return {
      COOPERATION_TYPE,
      SERVICE_TYPE,
      ROLE_TYPE,
      loading: false,
      activeTab: 'basic',
      editingAttrs: false,
      attrForm: {},
      projectObj: {},
      taskStats: {},
      quickProjectList: [],
      teamRows: [],
      currentRoleType: 'pm',
      contractAppendVisible: false,
      appendContractIds: [],
      contractOptions: [],
    };
  },
  computed: {
    currentProjectId() {
      return String(this.projectId || this.$route.query.projectId || this.$route.params.id || '');
    },
    visibleTabs() {
      const tabs = [{ key: 'basic', label: '项目属性', icon: 'fas fa-file-alt' }];
      if (isProposalApproved(this.projectObj)) {
        tabs.push({ key: 'milestone', label: '里程碑', icon: 'fas fa-flag', badge: (this.projectObj.milestones || []).length });
        tabs.push({ key: 'acceptance', label: '项目验收', icon: 'fas fa-check-circle' });
      }
      tabs.push({ key: 'team', label: '项目团队', icon: 'fas fa-users' });
      tabs.push({ key: 'files', label: '附件资料', icon: 'fas fa-paperclip' });
      return tabs;
    },
    /**
     * 验收门槛根据 acceptanceType 分流：
     * - 最终验收：所有任务完成 + 所有里程碑通过
     * - 中间验收：当前阶段里程碑通过即可（演示中放宽为：至少 1 个里程碑通过、任务过半）
     */
    canSubmitAcceptance() {
      const tasks = this.projectObj.tasks || [];
      const milestones = this.projectObj.milestones || [];
      if (!tasks.length || !milestones.length) return false;
      const passedMs = milestones.filter(m => m.status === 'passed').length;
      const interimOk = passedMs >= 1;
      const finalOk = tasks.every(t => t.status === 'completed' || t.status === 'cancelled') && milestones.every(m => m.status === 'passed');
      return (interimOk || finalOk) && (canAccept(this.projectObj) || this.projectObj.pomsStatus === 'completed');
    },
    /**
     * 项目完成门禁：必须存在最终验收通过的记录
     */
    canFinishProject() {
      const history = this.projectObj.acceptanceHistory || [];
      const finalPassed = history.some(a => !a.revoked && a.acceptanceType === 'final' && a.conclusion === 'passed');
      return finalPassed;
    },
    canEditProjectAttrs() {
      return this.currentRoleType === 'pm';
    },
    canOperateQuality() {
      return ['pm', 'tech', 'qa'].includes(this.currentRoleType);
    },
    permissionTips() {
      return {
        attrs: '当前角色无权限，项目经理可编辑项目属性',
      };
    },
    projectContracts() {
      if (this.projectObj.contracts?.length) return this.projectObj.contracts;
      if (!this.projectObj.contractId) return [];
      return [{ id: this.projectObj.contractId, code: this.projectObj.contractCode }];
    },
    availableContractOptions() {
      const linked = new Set(this.projectContracts.map(item => item.id));
      return this.contractOptions.filter(item => !linked.has(item.id) && (!item.projectId || item.projectId === this.currentProjectId));
    },
    fileRows() {
      const attachments = this.projectObj.attachments || {};
      const groups = [
        { key: 'technicalFiles', typeName: '技术文件' },
        { key: 'qualificationFiles', typeName: '资质文件' },
        { key: 'otherFiles', typeName: '其他附件' },
      ];
      return groups.flatMap(group => (attachments[group.key] || []).map(file => ({ ...file, typeName: group.typeName })));
    },
  },
  watch: {
    currentProjectId: {
      immediate: true,
      handler(id) {
        if (id) this.reload();
      },
    },
    '$route.query.tab': {
      immediate: true,
      handler(tab) {
        if (tab && ['basic', 'milestone', 'acceptance', 'team', 'files'].includes(tab)) {
          this.activeTab = tab;
        }
      },
    },
  },
  mounted() {
    this.loadQuickProjects();
    this.loadContractOptions();
  },
  methods: {
    labelOf,
    formatMoney(v) {
      return Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
    },
    loadQuickProjects() {
      getPage(1, 20, {}).then(res => {
        this.quickProjectList = res.data.data.records || [];
      });
    },
    loadContractOptions() {
      const s = loadStore();
      this.contractOptions = (s.contracts || []).filter(c => ['signed', 'executing', 'completed', 'terminated'].includes(c.contractStatus));
    },
    switchProject(p) {
      const id = String(p.id);
      if (this.$route.params.id) {
        this.$router.replace({ path: `/poms/phase2/projectSpace/${id}`, query: { tab: this.activeTab } });
      } else {
        this.$router.replace({ path: '/poms/phase2/projectSpace', query: { projectId: id, tab: this.activeTab } });
      }
    },
    reload() {
      if (!this.currentProjectId) return;
      this.loading = true;
      getDetail(this.currentProjectId)
        .then(res => {
          this.projectObj = res.data.data || {};
          this.teamRows = (this.projectObj.projectRoles || []).map(r => ({ ...r }));
          return getTaskStatsApi(this.currentProjectId);
        })
        .then(res => {
          const stats = res?.data?.data || {};
          this.taskStats = {
            ...stats,
            pendingReview: (this.projectObj.tasks || []).filter(t => t.status === 'pending_review').length,
          };
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleFinish() {
      if (!this.canFinishProject) {
        this.$message.warning('项目未通过最终验收，无法确认完成');
        return;
      }
      this.$confirm('最终验收已通过，确认将项目状态保持为已完成？', '确认项目完成', { type: 'warning' })
        .then(() => {
          finish(this.currentProjectId).then(() => {
            this.$message.success('项目已确认完成');
            this.reload();
          });
        })
        .catch(() => {});
    },
    startEditAttrs() {
      this.attrForm = {
        cooperationType: this.projectObj.cooperationType,
        partnerCompany: this.projectObj.partnerCompany || '',
        serviceType: this.projectObj.serviceType,
        description: this.projectObj.description || '',
      };
      this.editingAttrs = true;
    },
    saveAttrs() {
      updateProject(this.currentProjectId, this.attrForm).then(() => {
        this.$message.success('项目属性已保存');
        this.editingAttrs = false;
        this.reload();
      });
    },
    passMs(m) {
      this.$confirm(`确认里程碑「${m.name}」验收通过？`, '里程碑验收', { type: 'success' })
        .then(() => {
          finishMilestone({ id: m.id }).then(() => {
            this.$message.success('里程碑已通过');
            this.reload();
          });
        })
        .catch(() => {});
    },
    revokeMs(m) {
      this.$prompt('请输入撤销原因', '撤销里程碑通过', {
        inputType: 'textarea',
        inputValidator: v => (v && v.trim() ? true : '请填写撤销原因'),
      })
        .then(({ value }) => {
          revokeMilestone(m.id, value.trim()).then(() => {
            this.$message.warning('里程碑已通过状态已撤销');
            this.reload();
          });
        })
        .catch(() => {});
    },
    goProposal() {
      this.$router.push({ path: '/poms/phase2/proposal', query: { projectId: this.currentProjectId } });
    },
    openAttachContract() {
      this.loadContractOptions();
      this.appendContractIds = [];
      this.contractAppendVisible = true;
    },
    submitAttachContract() {
      attachContracts(this.currentProjectId, this.appendContractIds).then(() => {
        this.$message.success('合同已关联到项目');
        this.contractAppendVisible = false;
        this.reload();
      });
    },
    goContract(contractId) {
      const id = contractId || this.projectObj.contractId;
      if (id) {
        this.$router.push({ path: '/poms/phase1/contract', query: { contractId: id } });
      }
    },
    goExpense() {
      this.$router.push(`/projectManage/projectList/projectExpense/${this.currentProjectId}`);
    },
    goRisk() {
      this.$router.push({ path: '/projectManage/risk/index', query: { projectId: this.currentProjectId, projectName: this.projectObj.projectName } });
    },
    goOverdue() {
      this.$router.push({ path: '/projectManage/projectOverdueAlert/index', query: { projectId: this.currentProjectId, projectName: this.projectObj.projectName } });
    },
    goQuality() {
      this.$router.push({ path: '/projectManage/projectHealthMonitor/index', query: { projectId: this.currentProjectId, projectName: this.projectObj.projectName } });
    },
  },
};
</script>

<style lang="scss">
@import './projectSpace.scss';

.poms-project-space {
  .attr-form {
    max-width: 640px;
    margin-top: 12px;
  }
  .files-hint {
    color: #909399;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .contract-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .contract-tag {
    cursor: pointer;
  }
  .team-toolbar {
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  /* basic-container 内层卡片透明，露出 project-space-page 背景 */
  .basic-container__card {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .basic-container__card > .el-card__body {
    padding: 0;
  }
}
</style>
