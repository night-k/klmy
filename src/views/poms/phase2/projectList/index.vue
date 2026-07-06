<template>
  <basic-container class="grid-module poms-phase2-list">
    <el-tabs v-model="tabStatus" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane v-for="s in PROJECT_STATUS" :key="s.value" :label="s.label" :name="s.value" />
    </el-tabs>

    <el-form :inline="true" :model="query" label-width="90px" class="search-form">
      <el-form-item label="项目编号">
        <el-input v-model="query.code" placeholder="编号" clearable />
      </el-form-item>
      <el-form-item label="项目名称">
        <el-input v-model="query.projectName" placeholder="名称" clearable />
      </el-form-item>
      <el-form-item label="客户名称">
        <el-input v-model="query.customName" placeholder="客户" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="searchChange">搜索</el-button>
        <el-button icon="el-icon-delete" @click="searchReset">清空</el-button>
      </el-form-item>
    </el-form>

    <div class="page-button">
      <div class="view-switch">
        <el-button size="small" type="primary" plain @click="openManualInit">手工新增项目</el-button>
        <el-button size="small" plain @click="$router.push('/poms/phase1/contract')">前往合同管理</el-button>
        <el-button size="small" :type="isGrid ? 'primary' : ''" @click="isGrid = true">卡片</el-button>
        <el-button size="small" :type="!isGrid ? 'primary' : ''" @click="isGrid = false">列表</el-button>
      </div>
    </div>

    <div v-if="isGrid" class="project-grid">
      <div class="project-body">
        <div v-if="pageData.length" class="project-card-list">
          <el-card v-for="item in pageData" :key="item.id" class="model-base-item" shadow="hover">
            <div class="item-header">
              <p class="title">{{ item.projectName }}</p>
              <el-tag :type="PROJECT_STATUS_TAG[item.pomsStatus] || 'info'" size="small">{{ labelOf(PROJECT_STATUS, item.pomsStatus) }}</el-tag>
            </div>
            <div class="item-meta">
              <span class="project-code-chip">{{ item.code }}</span>
              <span class="meta-divider">|</span>
              <span>{{ labelOf(COOPERATION_TYPE, item.cooperationType) }}</span>
            </div>
            <p class="customer-row">客户：{{ item.customName }}</p>
            <p class="customer-row">合同：{{ item.contractCode || '-' }}</p>
            <div class="item-project-information">
              <div class="information-item">
                <p class="information-title">合同金额</p>
                <p class="information-content amount">¥{{ formatMoney(item.projectAmount) }}</p>
              </div>
              <div class="information-item">
                <p class="information-title">计划完成</p>
                <p class="information-content">{{ item.deliveryDate || '-' }}</p>
              </div>
            </div>
            <el-button type="primary" class="project-space" @click="rowProjectSpace(item)"> 进入项目空间 </el-button>
          </el-card>
        </div>
        <el-empty v-else description="暂无项目" />
      </div>
      <el-pagination v-model:current-page="page.currentPage" :page-size="page.pageSize" background layout="total, prev, pager, next" :total="page.total" @current-change="currentChange" />
    </div>

    <div v-else class="project-list-mode">
      <avue-crud ref="crud" v-model:page="page" :option="option" :table-loading="loading" :data="pageData" @on-load="onLoad" @refresh-change="onLoad">
        <template #code="{ row }">
          <el-link type="primary" @click="rowProjectSpace(row)">{{ row.code }}</el-link>
        </template>
        <template #cooperationType="{ row }">{{ labelOf(COOPERATION_TYPE, row.cooperationType) }}</template>
        <template #projectAmount="{ row }">¥{{ formatMoney(row.projectAmount) }}</template>
        <template #pomsStatus="{ row }">
          <el-tag :type="PROJECT_STATUS_TAG[row.pomsStatus] || 'info'">{{ labelOf(PROJECT_STATUS, row.pomsStatus) }}</el-tag>
        </template>
        <template #menu="{ row }">
          <el-button type="primary" link @click="rowProjectSpace(row)">进入空间</el-button>
        </template>
      </avue-crud>
    </div>

    <project-init-dialog v-model="initVisible" :contract-id="initContractId" @success="onInitSuccess" />
  </basic-container>
</template>

<script>
import { ListOption } from '../option/projectList';
import { PROJECT_STATUS, COOPERATION_TYPE, PROJECT_STATUS_TAG, labelOf } from '../option/dict';
import { getPage } from '@/api/poms/phase2/projectAdapter';
import ProjectInitDialog from './ProjectInitDialog.vue';

export default {
  components: { ProjectInitDialog },
  data() {
    return {
      PROJECT_STATUS,
      COOPERATION_TYPE,
      PROJECT_STATUS_TAG,
      tabStatus: '',
      query: {},
      loading: false,
      isGrid: true,
      option: ListOption(this),
      page: { pageSize: 10, currentPage: 1, total: 0 },
      pageData: [],
      initVisible: false,
      initContractId: '',
    };
  },
  mounted() {
    this.checkInitQuery();
    this.onLoad();
  },
  methods: {
    labelOf,
    formatMoney(v) {
      return Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
    },
    checkInitQuery() {
      const { contractId, action } = this.$route.query;
      if (contractId && action === 'init') {
        this.initContractId = contractId;
        this.initVisible = true;
      }
    },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad();
    },
    onLoad() {
      this.loading = true;
      const params = { ...this.query };
      if (this.tabStatus) params.pomsStatus = this.tabStatus;
      getPage(this.page.currentPage, this.page.pageSize, params)
        .then(res => {
          const data = res.data.data;
          this.pageData = data.records;
          this.page.total = data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    searchChange() {
      this.page.currentPage = 1;
      this.onLoad();
    },
    searchReset() {
      this.query = {};
      this.onLoad();
    },
    currentChange(p) {
      this.page.currentPage = p;
      this.onLoad();
    },
    openManualInit() {
      this.initContractId = '';
      this.initVisible = true;
    },
    rowProjectSpace(row) {
      this.$router.push({
        path: '/poms/phase2/projectSpace',
        query: { projectId: row.id, projectName: row.projectName, projectCode: row.code },
      });
    },
    onInitSuccess(project) {
      this.onLoad();
      if (project?.id) {
        this.$router.replace({ path: '/poms/phase2/projectList' });
        this.rowProjectSpace(project);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.search-form {
  margin-bottom: 12px;
}
.page-button {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.view-switch {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}
.project-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.model-base-item {
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    .title {
      font-weight: 600;
      margin: 0;
      flex: 1;
    }
  }
  .item-meta {
    color: #909399;
    font-size: 13px;
    margin-bottom: 8px;
  }
  .customer-row {
    font-size: 13px;
    color: #606266;
    margin: 4px 0;
  }
  .item-project-information {
    display: flex;
    gap: 24px;
    margin: 12px 0;
    .information-title {
      font-size: 12px;
      color: #909399;
      margin: 0;
    }
    .information-content {
      margin: 4px 0 0;
      font-weight: 600;
      &.amount {
        color: #e6a23c;
      }
    }
  }
  .project-space {
    width: 100%;
    margin-top: 8px;
  }
}
.project-body {
  min-height: 200px;
  margin-bottom: 16px;
}
</style>
