<template>
  <el-container class="demo-layout">
    <el-aside width="220px" class="demo-layout__aside">
      <div class="demo-layout__brand">销售管理演示</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="demo-layout__menu"
        background-color="#ffffff"
        text-color="#303133"
        active-text-color="#409eff"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="demo-layout__header" height="56px">
        <span class="demo-layout__header-title">{{ currentTitle }}</span>
        <div class="demo-layout__header-actions">
          <el-tag type="info" effect="plain" size="small">Mock 演示 · 数据存于浏览器</el-tag>
          <el-button type="success" plain size="small" @click="goProject">项目主线</el-button>
        </div>
      </el-header>
      <el-main class="demo-layout__main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'DemoLayout',
  data() {
    return {
      menuItems: [
        { title: '演示首页', path: '/poms/phase1/index' },
        { title: '客户管理', path: '/poms/phase1/customer' },
        { title: '商机管理', path: '/poms/phase1/opportunity' },
        { title: '招投标管理', path: '/poms/phase1/tender' },
        { title: '中标管理', path: '/poms/phase1/winbid' },
        { title: '合同管理', path: '/poms/phase1/contract' },
        { title: '回款管理', path: '/poms/phase1/payment' },
      ],
    };
  },
  computed: {
    activeMenu() {
      return this.$route.path;
    },
    currentTitle() {
      return this.$route.meta?.title || '销售管理演示';
    },
  },
  methods: {
    goProject() {
      this.$router.push('/poms/phase2/index');
    },
  },
};
</script>

<style lang="scss" scoped>
.demo-layout {
  height: 100vh;
  background: #f0f2f5;

  &__aside {
    border-right: 1px solid #ebeef5;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  &__brand {
    height: 56px;
    line-height: 56px;
    padding: 0 20px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    padding: 0 20px;
  }

  &__header-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__main {
    padding: 0;
    overflow: auto;
    background: #f0f2f5;
  }
}
</style>
