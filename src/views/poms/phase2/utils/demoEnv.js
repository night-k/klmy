/**
 * 演示环境工具：用于包裹仅演示/Mock 用的 UI 控件，生产构建时自动剥离。
 *
 * 用法：
 *   <el-button v-if="isDemoEnv">重置演示数据</el-button>
 *   import { isDemoEnv } from '../utils/demoEnv';
 *
 * 注意：所有"演示用"控件（重置数据按钮、演示项目 select、Mock 字段如优先级/业务状态）
 * 必须以此工具包裹，避免污染生产环境。
 */
export const isDemoEnv = (() => {
  // 兼容 Vite (import.meta.env) 与 Webpack (process.env)
  let mode = 'development';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      mode = import.meta.env.MODE || import.meta.env.NODE_ENV || 'development';
    } else if (typeof process !== 'undefined' && process.env) {
      mode = process.env.NODE_ENV || 'development';
    }
  } catch (e) {
    mode = 'development';
  }
  // 仅在开发或带 DEMO 标记的环境展示演示控件
  return mode !== 'production';
})();

export default isDemoEnv;
