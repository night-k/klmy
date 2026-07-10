<template>
  <basic-container>
    <el-tabs v-model="tabResult" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待开标" name="pending" />
      <el-tab-pane label="中标" name="won" />
      <el-tab-pane label="未中标" name="lost" />
      <el-tab-pane label="流标" name="abort" />
    </el-tabs>
    <avue-crud
      ref="crud"
      v-model:page="page"
      v-model:search="search"
      :option="option"
      :table-loading="loading"
      :data="data"
      @row-del="rowDel"
      @search-change="searchChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @size-change="sizeChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >
      <template #menu-left>
        <el-button type="primary" @click="handleAdd">新增投标</el-button>
      </template>
      <template #code="{ row }">
        <el-link type="primary" @click="openView(row)">{{ row.code }}</el-link>
      </template>
      <template #menu="{ row, size }">
        <el-button type="primary" link :size="size" @click="openView(row)">查看</el-button>
        <el-button type="primary" link :size="size" @click="handleEdit(row)">编辑</el-button>
        <el-button v-if="row.result === 'won' && !row.winbidId" type="success" link :size="size" @click="openWinbidDialog(row)">登记中标</el-button>
        <el-button v-if="row.result === 'won' && row.winbidId" type="success" link :size="size" @click="openWinbidDialog(row)">编辑中标</el-button>
        <el-button v-if="row.result === 'won' && row.winbidId && row.contractStatus !== 'generated'" type="primary" link :size="size" @click="createContract(row)">生成合同</el-button>
        <el-button v-if="row.result === 'won' && row.contractStatus === 'generated'" type="primary" link :size="size" @click="goContract(row)">查看合同</el-button>
      </template>
      <template #result="{ row }">
        <el-tag :type="TENDER_RESULT_TAG[row.result]">{{ labelOf(TENDER_RESULT, row.result) }}</el-tag>
      </template>
      <template #winbidCode="{ row }">
        <el-link v-if="row.winbidCode" type="success" @click="openWinbidDialog(row)">{{ row.winbidCode }}</el-link>
        <span v-else>-</span>
      </template>
      <template #contractStatus="{ row }">
        <el-tag v-if="row.contractStatus" :type="row.contractStatus === 'generated' ? 'success' : 'warning'">
          {{ labelOf(WIN_CONTRACT_STATUS, row.contractStatus) }}
        </el-tag>
        <span v-else>-</span>
      </template>
      <template #contractCode="{ row }">
        <el-link v-if="row.contractCode" type="primary" @click="goContract(row)">{{ row.contractCode }}</el-link>
        <span v-else>-</span>
      </template>
    </avue-crud>

    <tender-view-drawer
      v-model="viewVisible"
      :detail="viewDetail"
      :loading="viewLoading"
      @edit-result="openResultDialog"
      @edit-tender="editFromView"
      @register-winbid="openWinbidDialog"
      @edit-winbid="openWinbidDialog"
      @create-contract="createContract"
      @view-contract="goContract"
      @save-files="saveBidFiles"
      @save-notice-files="saveNoticeFiles"
      @closed="viewDetail = null"
    />

    <tender-result-dialog v-model="resultDialogVisible" :detail="viewDetail" @submit="submitResultChange" />

    <crud-form-drawer ref="editRef" :crud-option="option" add-title="新增投标" edit-title="编辑投标" size="820px" @save="handleFormSave">
      <template #bidFiles="{ form }">
        <bid-file-panel v-model="form.bidFiles" />
      </template>
    </crud-form-drawer>

    <winbid-form-drawer ref="winbidRef" @save="saveWinbid" />
  </basic-container>
</template>

<script>
import { Option } from '../option/tender';
import BidFilePanel from '../components/BidFilePanel.vue';
import TenderViewDrawer from '../components/TenderViewDrawer.vue';
import TenderResultDialog from '../components/TenderResultDialog.vue';
import CrudFormDrawer from '../components/CrudFormDrawer.vue';
import WinbidFormDrawer from '../components/WinbidFormDrawer.vue';
import { TENDER_RESULT, TENDER_RESULT_TAG, WIN_CONTRACT_STATUS, labelOf } from '../option/dict';
import { getPage, getDetail, add, update, remove } from '@/api/poms/phase1/tender';
import { getList as getOpportunities, update as updateOpportunity } from '@/api/poms/phase1/opportunity';
import { getList as getWinbids, getDetail as getWinbidDetail, add as addWinbid, update as updateWinbid, generateContract } from '@/api/poms/phase1/winbid';

export default {
  components: { BidFilePanel, TenderViewDrawer, TenderResultDialog, CrudFormDrawer, WinbidFormDrawer },
  data() {
    return {
      tabResult: '',
      search: {},
      query: {},
      loading: false,
      page: { pageSize: 10, currentPage: 1, total: 0 },
      option: Option(this),
      data: [],
      opportunities: [],
      pendingOpportunityId: '',
      viewVisible: false,
      viewDetail: null,
      viewLoading: false,
      resultDialogVisible: false,
      TENDER_RESULT,
      TENDER_RESULT_TAG,
      WIN_CONTRACT_STATUS,
      labelOf,
    };
  },
  mounted() {
    const { opportunityId, tab } = this.$route.query;
    if (tab) this.tabResult = tab;
    if (opportunityId) {
      this.pendingOpportunityId = opportunityId;
      this.$nextTick(() => this.handleAdd());
    }
  },
  methods: {
    openView(row) {
      this.viewLoading = true;
      this.viewVisible = true;
      getDetail(row.id)
        .then(res => {
          const tender = { ...res.data.data, bidFiles: res.data.data.bidFiles || [] };
          return this.enrichTender(tender).then(item => {
            this.viewDetail = item;
          });
        })
        .finally(() => {
          this.viewLoading = false;
        });
    },
    refreshViewDetail(id) {
      if (!this.viewVisible || !id) return;
      getDetail(id).then(res => {
        const tender = { ...res.data.data, bidFiles: res.data.data.bidFiles || [] };
        this.enrichTender(tender).then(item => {
          this.viewDetail = item;
        });
      });
    },
    openResultDialog() {
      this.resultDialogVisible = true;
    },
    submitResultChange(payload) {
      if (!this.viewDetail) return;
      update({ ...this.viewDetail, ...payload }).then(() => {
        this.onLoad(this.page);
        this.refreshViewDetail(this.viewDetail.id);
        this.$message.success('中标结果已更新');
      });
    },
    enrichTender(tender) {
      if (!tender?.id) return Promise.resolve(tender);
      return getWinbids(1, 100, { tenderId: tender.id }).then(res => {
        const win = res.data.data.records[0];
        if (!win) return { ...tender, contractStatus: tender.contractStatus || '', noticeFiles: tender.noticeFiles || [] };
        return {
          ...tender,
          winbidId: win.id,
          winbidCode: win.code,
          winAmount: win.winAmount,
          winDate: win.winDate,
          winNoticeNo: win.noticeNo,
          servicePeriod: win.servicePeriod,
          performanceBond: win.performanceBond,
          serviceFee: win.serviceFee,
          contractStatus: win.contractStatus,
          contractId: win.contractId,
          contractCode: win.contractCode,
          noticeFiles: win.noticeFiles || [],
        };
      });
    },
    enrichTenderRows(rows) {
      return getWinbids(1, 100).then(res => {
        const winMap = new Map((res.data.data.records || []).map(item => [item.tenderId, item]));
        return rows.map(row => {
          const win = winMap.get(row.id);
          if (!win) return { ...row, contractStatus: row.contractStatus || '' };
          return {
            ...row,
            winbidId: win.id,
            winbidCode: win.code,
            winAmount: win.winAmount,
            winDate: win.winDate,
            winNoticeNo: win.noticeNo,
            contractStatus: win.contractStatus,
            contractId: win.contractId,
            contractCode: win.contractCode,
          };
        });
      });
    },
    saveBidFiles(row) {
      update({ ...row, bidFiles: row.bidFiles || [] }).then(() => {
        this.refreshViewDetail(row.id);
        this.onLoad(this.page);
        this.$message.success('投标文件已保存');
      });
    },
    handleAdd() {
      this.loadOpportunities().then(() => {
        const form = { result: 'pending', tenderMethod: 'public', opportunityId: '', bidFiles: [] };
        const oppId = this.pendingOpportunityId || this.$route.query.opportunityId;
        if (oppId) {
          form.opportunityId = oppId;
          this.onOppChange(oppId, form);
          this.pendingOpportunityId = '';
        }
        this.$refs.editRef?.open(form);
      });
    },
    handleEdit(row) {
      this.loadOpportunities().then(() => {
        getDetail(row.id).then(res => {
          this.$refs.editRef?.open({ ...res.data.data, bidFiles: res.data.data.bidFiles || [] });
        });
      });
    },
    editFromView(row) {
      this.viewVisible = false;
      this.handleEdit(row);
    },
    handleFormSave(row, { done, loading }) {
      if (!row.opportunityId) {
        this.$message.warning('请选择商机');
        loading();
        return;
      }
      const payload = { ...row, bidFiles: row.bidFiles || [] };
      const request = row.id ? update(payload) : add(payload);
      request
        .then(res => {
          if (!row.id) {
            const tender = res.data.data;
            if (tender?.opportunityId) {
              updateOpportunity({ id: tender.opportunityId, tenderId: tender.id }).then(() => {});
            }
          }
          this.onLoad(this.page);
          this.$message.success(row.id ? '更新成功' : '保存成功');
          this.refreshViewDetail(row.id);
          done();
        })
        .finally(() => loading());
    },
    loadOpportunities() {
      return getOpportunities(1, 100).then(res => {
        this.opportunities = res.data.data.records.filter(o => o.status !== 'lost');
        const col = this.findObject(this.option.column, 'opportunityId');
        if (col) {
          col.dicData = this.opportunities.map(o => ({
            id: o.id,
            name: `${o.code} - ${o.projectName}`,
          }));
        }
      });
    },
    onOppChange(id, targetForm) {
      const o = this.opportunities.find(x => x.id === id);
      const patch = o
        ? {
            opportunityId: id,
            opportunityName: o.projectName,
            projectName: o.projectName,
            customerName: o.customerName,
            tenderOrg: o.customerName,
          }
        : { opportunityId: id };
      if (targetForm) {
        Object.assign(targetForm, patch);
        return;
      }
      this.$refs.editRef?.setForm(patch);
    },
    onTabChange() {
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    openWinbidDialog(row) {
      const tender = row || this.viewDetail;
      if (!tender) return;
      const open = win => {
        this.$refs.winbidRef?.open({
          id: win?.id || '',
          tenderId: tender.id,
          tenderCode: tender.code,
          projectName: tender.projectName,
          customerName: tender.customerName,
          noticeNo: win?.noticeNo || tender.winNoticeNo || '',
          winAmount: win?.winAmount ?? tender.winAmount ?? tender.bidAmount ?? 0,
          winDate: win?.winDate || tender.winDate || '',
          servicePeriod: win?.servicePeriod || '',
          performanceBond: win?.performanceBond ?? 0,
          serviceFee: win?.serviceFee ?? 0,
          contractStatus: win?.contractStatus || 'pending',
          contractId: win?.contractId || '',
          contractCode: win?.contractCode || '',
          noticeFiles: win?.noticeFiles ? [...win.noticeFiles] : [],
        });
      };
      if (tender.winbidId) {
        getWinbidDetail(tender.winbidId).then(res => open(res.data.data));
        return;
      }
      getWinbids(1, 100, { tenderId: tender.id }).then(res => open(res.data.data.records[0]));
    },
    saveWinbid(payload, { done, loading }) {
      const request = payload.id ? updateWinbid(payload) : addWinbid(payload);
      request
        .then(res => {
          const win = res.data.data;
          return update({
            id: win.tenderId,
            result: 'won',
            winAmount: win.winAmount,
            winDate: win.winDate,
            winNoticeNo: win.noticeNo,
            winbidId: win.id,
          });
        })
        .then(() => {
          this.onLoad(this.page);
          this.refreshViewDetail(payload.tenderId);
          this.$message.success('中标信息已保存');
          done();
        })
        .finally(() => loading());
    },
    saveNoticeFiles(row) {
      if (!row.winbidId) return;
      updateWinbid({ id: row.winbidId, noticeFiles: row.noticeFiles || [] }).then(() => {
        this.refreshViewDetail(row.id);
        this.onLoad(this.page);
        this.$message.success('中标通知书已保存');
      });
    },
    createContract(row) {
      if (!row.winbidId) {
        this.$message.warning('请先登记中标信息');
        return;
      }
      generateContract(row.winbidId).then(res => {
        const contract = res.data.data;
        this.$message.success('合同草稿已生成');
        this.onLoad(this.page);
        this.refreshViewDetail(row.id);
        if (contract?.id) {
          this.$router.push({ path: '/poms/phase1/contract', query: { id: contract.id } });
        }
      });
    },
    goContract(row) {
      if (!row.contractId) {
        this.$message.warning('暂无关联合同');
        return;
      }
      this.$router.push({ path: '/poms/phase1/contract', query: { id: row.contractId } });
    },
    rowDel(row) {
      this.$confirm('确定删除？')
        .then(() => remove(row.id))
        .then(() => this.onLoad(this.page));
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page);
      done();
    },
    currentChange(p) {
      this.page.currentPage = p;
    },
    sizeChange(s) {
      this.page.pageSize = s;
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    onLoad(page) {
      this.loading = true;
      const q = { ...this.query };
      if (this.tabResult) q.result = this.tabResult;
      getPage(page.currentPage, page.pageSize, q)
        .then(res => {
          this.page.total = res.data.data.total;
          return this.enrichTenderRows(res.data.data.records || []);
        })
        .then(records => {
          this.data = records;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
