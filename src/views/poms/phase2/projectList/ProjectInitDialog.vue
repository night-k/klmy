<template>
  <el-dialog v-model="visible" title="项目立项" width="620px" append-to-body @closed="$emit('closed')">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item v-if="contractId" label="关联合同">
        <el-input :model-value="contractLabel" disabled />
      </el-form-item>
      <el-form-item v-else label="关联合同">
        <el-select v-model="selectedContractIds" multiple filterable clearable collapse-tags collapse-tags-tooltip placeholder="可选择多个已签合同" style="width: 100%" @change="onContractsChange">
          <el-option v-for="item in contractOptions" :key="item.id" :label="`${item.code} - ${item.projectName}`" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!contractId" label="客户名称" prop="customerName">
        <el-input v-model="form.customerName" placeholder="手工创建项目时必填" />
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="form.projectName" placeholder="默认取合同项目名" />
      </el-form-item>
      <el-form-item label="合作类型" prop="cooperationType">
        <el-radio-group v-model="form.cooperationType" @change="onCooperationChange">
          <el-radio value="self">自营</el-radio>
          <el-radio value="joint">联营</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.cooperationType === 'joint'" label="合作公司" prop="partnerCompany">
        <el-input v-model="form.partnerCompany" placeholder="联营时必填" />
      </el-form-item>
      <el-form-item label="服务类型" prop="serviceType">
        <el-select v-model="form.serviceType" style="width: 100%">
          <el-option v-for="item in SERVICE_TYPE" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目经理" prop="projectManagerId">
        <el-select v-model="form.projectManagerId" filterable style="width: 100%" @change="onManagerChange">
          <el-option v-for="u in MOCK_USERS" :key="u.id" :label="u.name" :value="u.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目预算" prop="budget">
        <el-input-number v-model="form.budget" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>
      <el-form-item label="计划开始" prop="planStartDate">
        <el-date-picker v-model="form.planStartDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item label="计划结束" prop="planEndDate">
        <el-date-picker v-model="form.planEndDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item label="立项材料">
        <el-upload v-model:file-list="techFiles" action="#" :auto-upload="false" multiple>
          <el-button type="primary" plain size="small">技术文件</el-button>
        </el-upload>
        <el-upload v-model:file-list="qualFiles" action="#" :auto-upload="false" multiple style="margin-top: 8px">
          <el-button type="primary" plain size="small">资质文件</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确认立项</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { SERVICE_TYPE, MOCK_USERS } from '../option/dict';
import { initFromContract } from '@/api/poms/phase2/projectAdapter';
import { loadStore } from '@/api/poms/phase1/mockStore';

export default {
  props: {
    modelValue: Boolean,
    contractId: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'success', 'closed'],
  data() {
    const validatePlanEnd = (_rule, value, cb) => {
      if (!value) return cb(new Error('请选择计划结束日期'));
      if (this.form.planStartDate && value < this.form.planStartDate) {
        return cb(new Error('计划结束不能早于计划开始'));
      }
      cb();
    };
    const validatePartner = (_rule, value, cb) => {
      if (this.form.cooperationType === 'joint' && !(value || '').trim()) {
        return cb(new Error('联营项目请填写合作公司'));
      }
      cb();
    };
    return {
      SERVICE_TYPE,
      MOCK_USERS,
      loading: false,
      contract: null,
      contractOptions: [],
      selectedContractIds: [],
      techFiles: [],
      qualFiles: [],
      form: {
        projectName: '',
        customerName: '',
        cooperationType: 'self',
        partnerCompany: '',
        serviceType: 'tech_service',
        projectManagerId: 'u001',
        projectManagerName: '张明',
        budget: 0,
        planStartDate: '',
        planEndDate: '',
      },
      rules: {
        projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
        cooperationType: [{ required: true, message: '请选择合作类型', trigger: 'change' }],
        projectManagerId: [{ required: true, message: '请选择项目经理', trigger: 'change' }],
        planStartDate: [{ required: true, message: '请选择计划开始', trigger: 'change' }],
        planEndDate: [{ required: true, validator: validatePlanEnd, trigger: 'change' }],
        partnerCompany: [{ validator: validatePartner, trigger: 'blur' }],
      },
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },
    contractLabel() {
      if (!this.contract) return '手工创建项目';
      return `${this.contract.code} - ${this.contract.projectName}`;
    },
  },
  watch: {
    contractId: {
      immediate: true,
      handler(id) {
        if (id) this.loadContract(id);
        else this.contract = null;
      },
    },
    visible(val) {
      if (val) this.loadContractOptions();
    },
  },
  methods: {
    loadContract(id) {
      const s = loadStore();
      this.contract = s.contracts.find(c => c.id === id);
      if (!this.contract) return;
      this.form.projectName = this.contract.projectName;
      this.form.customerName = this.contract.customerName;
      this.form.budget = this.contract.contractAmount;
      this.form.planStartDate = this.contract.serviceStartDate || '';
      this.form.planEndDate = this.contract.serviceEndDate || '';
      this.form.serviceType = this.contract.contractType || 'tech_service';
    },
    loadContractOptions() {
      const s = loadStore();
      this.contractOptions = (s.contracts || []).filter(c => ['signed', 'executing', 'completed'].includes(c.contractStatus) && !c.projectId);
    },
    onContractsChange(ids) {
      const selected = ids.map(id => this.contractOptions.find(c => c.id === id)).filter(Boolean);
      if (!selected.length) return;
      const first = selected[0];
      this.form.projectName = this.form.projectName || first.projectName;
      this.form.customerName = this.form.customerName || first.customerName;
      this.form.budget = selected.reduce((sum, item) => sum + (Number(item.contractAmount) || 0), 0);
      this.form.planStartDate =
        selected
          .map(item => item.serviceStartDate)
          .filter(Boolean)
          .sort()[0] || this.form.planStartDate;
      this.form.planEndDate =
        selected
          .map(item => item.serviceEndDate)
          .filter(Boolean)
          .sort()
          .pop() || this.form.planEndDate;
      this.form.serviceType = first.contractType || this.form.serviceType;
    },
    onCooperationChange(val) {
      if (val === 'self') this.form.partnerCompany = '';
    },
    onManagerChange(id) {
      const u = MOCK_USERS.find(x => x.id === id);
      this.form.projectManagerName = u?.name || '';
    },
    mapFiles(list) {
      return (list || []).map(f => ({ name: f.name, url: f.url || '#' }));
    },
    submit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return;
        this.loading = true;
        const payload = {
          ...this.form,
          contractIds: this.contractId ? [this.contractId] : this.selectedContractIds,
          attachments: {
            technicalFiles: this.mapFiles(this.techFiles),
            qualificationFiles: this.mapFiles(this.qualFiles),
            otherFiles: [],
          },
        };
        initFromContract(this.contractId, payload)
          .then(res => {
            const project = res?.data?.data;
            const code = project?.code || '';
            this.$message.success(code ? `项目立项成功，项目编号：${code}` : '项目立项成功');
            this.visible = false;
            this.$emit('success', project);
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
  },
};
</script>
