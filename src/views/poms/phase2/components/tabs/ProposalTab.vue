<template>
  <div class="proposal-tab">
    <el-empty v-if="!proposal && !editing" description="尚未创建开题报告">
      <el-button type="primary" @click="startEdit">创建开题报告</el-button>
    </el-empty>
    <template v-else>
      <el-form v-if="editing" :model="form" label-width="100px">
        <el-form-item label="报告标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="版本号"><el-input v-model="form.version" placeholder="如 v1.0" /></el-form-item>
        <el-form-item label="报告正文"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="服务内容"><el-input v-model="form.serviceContent" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="报告附件">
          <el-upload v-model:file-list="proposalFiles" action="#" :auto-upload="false" multiple>
            <el-button type="primary" plain size="small">上传开题报告</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="团队成员">
          <el-table :data="form.teamMembers" border size="small">
            <el-table-column label="姓名"
              ><template #default="{ row }"><el-input v-model="row.name" /></template
            ></el-table-column>
            <el-table-column label="角色"
              ><template #default="{ row }"><el-input v-model="row.role" /></template
            ></el-table-column>
            <el-table-column label="职责"
              ><template #default="{ row }"><el-input v-model="row.duty" /></template
            ></el-table-column>
            <el-table-column label="投入%" width="90"
              ><template #default="{ row }"><el-input-number v-model="row.ratio" :min="0" :max="100" size="small" /></template
            ></el-table-column>
            <el-table-column width="60"
              ><template #default="{ $index }"><el-button link type="danger" @click="form.teamMembers.splice($index, 1)">删</el-button></template></el-table-column
            >
          </el-table>
          <el-button link type="primary" @click="form.teamMembers.push({ name: '', role: '项目成员', duty: '', ratio: 100 })">+ 添加成员</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="editing = false">取消</el-button>
        </el-form-item>
      </el-form>
      <div v-else class="proposal-view">
        <div class="proposal-head">
          <h3>{{ proposal.title }}</h3>
          <el-tag :type="proposal.auditStatus === 'approved' ? 'success' : 'warning'">{{ labelOf(PROPOSAL_STATUS, proposal.auditStatus) }}</el-tag>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="报告正文">{{ proposal.content }}</el-descriptions-item>
          <el-descriptions-item label="服务内容">{{ proposal.serviceContent }}</el-descriptions-item>
          <el-descriptions-item label="当前版本">{{ proposal.version || 'v1.0' }}</el-descriptions-item>
          <el-descriptions-item label="附件">
            <el-tag v-for="file in proposal.files || []" :key="file.name" size="small" style="margin-right: 6px">{{ file.name }}</el-tag>
            <span v-if="!(proposal.files || []).length">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ proposal.submitTime || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="proposal.versionHistory || []" border size="small" style="margin-top: 12px" empty-text="暂无历史版本">
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="time" label="保存时间" width="160" />
          <el-table-column prop="fileCount" label="附件数" width="90" />
          <el-table-column prop="remark" label="说明" min-width="160" show-overflow-tooltip />
        </el-table>
        <el-table :data="proposal.teamMembers || []" border size="small" style="margin-top: 12px">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="role" label="角色" />
          <el-table-column prop="duty" label="职责" />
          <el-table-column prop="ratio" label="投入%" width="80" />
        </el-table>
        <div class="actions">
          <el-button v-if="proposal.auditStatus !== 'approved'" @click="startEdit">编辑</el-button>
          <el-button v-if="!proposal.submitTime && proposal.auditStatus !== 'approved'" type="primary" @click="submit">提交</el-button>
          <el-button v-if="proposal.auditStatus === 'submitted'" type="success" @click="approve">审核通过</el-button>
          <el-button v-if="proposal.auditStatus === 'submitted'" type="danger" @click="reject">驳回</el-button>
          <span v-if="proposal.auditStatus === 'rejected'" class="rejected-hint">
            已驳回：{{ proposal.rejectReason || '请按审核意见修改后重新提交' }}
            <el-button type="primary" link @click="reSubmit">修改后重新提交</el-button>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { PROPOSAL_STATUS, labelOf } from '../../option/dict';
import { getPage, add, update, approve, reject } from '@/api/poms/phase2/proposal';

export default {
  props: { projectId: { type: String, required: true } },
  emits: ['changed'],
  data() {
    return {
      PROPOSAL_STATUS,
      proposal: null,
      editing: false,
      form: { title: '', version: 'v1.0', content: '', serviceContent: '', teamMembers: [] },
      proposalFiles: [],
    };
  },
  watch: {
    projectId: {
      immediate: true,
      handler() {
        this.load();
      },
    },
  },
  methods: {
    labelOf,
    load() {
      getPage(1, 10, { projectId: this.projectId }).then(res => {
        this.proposal = res.data.data.records[0] || null;
      });
    },
    startEdit() {
      this.form = this.proposal
        ? { ...this.proposal, version: this.proposal.version || 'v1.0', teamMembers: [...(this.proposal.teamMembers || [])] }
        : {
            title: '开题报告',
            version: 'v1.0',
            content: '',
            serviceContent: '',
            teamMembers: [
              { name: '李华', role: '项目经理', duty: '项目统筹', ratio: 100 },
              { name: '王磊', role: '技术负责人', duty: '技术方案', ratio: 80 },
              { name: '赵敏', role: '质量负责人', duty: '成果审核', ratio: 60 },
            ],
          };
      this.proposalFiles = (this.form.files || []).map(f => ({ name: f.name, url: f.url || '#' }));
      this.editing = true;
    },
    mapFiles(list) {
      return (list || []).map(f => ({ name: f.name, url: f.url || '#' }));
    },
    save() {
      const files = this.mapFiles(this.proposalFiles);
      const versionHistory = [
        {
          version: this.form.version || 'v1.0',
          time: new Date().toISOString().slice(0, 19).replace('T', ' '),
          fileCount: files.length,
          remark: this.proposal ? '编辑保存' : '创建开题报告',
        },
        ...((this.proposal && this.proposal.versionHistory) || []),
      ];
      const payload = { ...this.form, files, versionHistory, projectId: this.projectId, auditStatus: 'draft' };
      const req = this.proposal ? update({ ...payload, id: this.proposal.id }) : add(payload);
      req.then(res => {
        this.proposal = res.data.data;
        this.editing = false;
        this.$message.success('已保存');
        this.load();
      });
    },
    submit() {
      update({ ...this.proposal, auditStatus: 'submitted', submitTime: new Date().toISOString().slice(0, 19).replace('T', ' ') }).then(() => {
        this.$message.success('已提交，等待审核');
        this.load();
      });
    },
    approve() {
      this.$confirm('确认审核通过？将通过后将自动生成里程碑并同步团队角色。', '审核通过', { type: 'success' })
        .then(() => {
          approve(this.proposal.id).then(() => {
            this.$message.success('开题报告已通过，已生成里程碑并同步团队角色');
            this.load();
            this.$emit('changed');
          });
        })
        .catch(() => {});
    },
    reject() {
      this.$prompt('请输入驳回意见', '开题报告驳回', {
        inputType: 'textarea',
        inputValidator: v => (v && v.trim() ? true : '请填写驳回意见'),
      })
        .then(({ value }) => {
          reject(this.proposal.id, value.trim()).then(() => {
            this.$message.warning('已驳回，开题人可修改后重新提交');
            this.load();
            this.$emit('changed');
          });
        })
        .catch(() => {});
    },
    reSubmit() {
      this.startEdit();
    },
  },
};
</script>

<style scoped>
.proposal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.rejected-hint {
  color: #f56c6c;
  font-size: 13px;
  margin-left: 8px;
}
</style>
