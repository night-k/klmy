import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import Avue from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';
import AvueZhLocale from '@smallwei/avue/lib/src/locale/lang/zh';
import axios from 'axios';
import dayjs from 'dayjs';
import App from './App.vue';
import router from './router';
import BasicContainer from './components/basic-container/main.vue';
import './styles/demo.scss';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.component('BasicContainer', BasicContainer);
app.config.globalProperties.$dayjs = dayjs;

app.use(ElementPlus, { locale: zhCn });
app.use(Avue, {
  axios,
  calcHeight: 10,
  locale: AvueZhLocale,
});
app.use(router);

app.mount('#app');
