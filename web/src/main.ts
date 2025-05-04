import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const app = createApp(App);

app.use(router);

app.mount('#app');
