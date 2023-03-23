import { createHead } from '@vueuse/head';
import { createApp } from 'vue';
import vuetify from './_misc/vuetify';
import App from './editTweet/main.vue';

const app = createApp(App);
const head = createHead();

app.use(vuetify);
app.use(head);

app.mount('#app');
