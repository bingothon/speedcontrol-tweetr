<script lang="ts">
import { defineComponent } from 'vue';
import { useHead } from '@vueuse/head';
import { useReplicant } from 'nodecg-vue-composable';
import { Settings } from '@tweetr/types/schemas';

export default defineComponent({
  setup() {
    useHead({ title: 'Tweetr settings' });

    const settingsReplicant = useReplicant<Settings>('settings', 'speedcontrol-tweetr');

    if (!settingsReplicant) {
      throw new Error('Missing settings');
    }

    return {
      settingsReplicant,
    };
  },
  data: () => ({
    importLoading: false,
    exportLoading: false,
  }),
  computed: {
    settings(): Settings {
      if (this.settingsReplicant.data) {
        return this.settingsReplicant.data;
      }

      return { autoTweet: false, countdown: 0 };
    },
    countdownTime: {
      get() {
        return this.settings.countdown;
      },
      set(value: string) {
        this.settings.countdown = parseInt(value, 10);

        this.settingsReplicant.save();
      },
    },
  },
  methods: {
    setAutotweet(enabled: boolean): void {
      this.settings.autoTweet = enabled;

      this.settingsReplicant.save();
    },
    startImportCSV(): void {
      (this.$refs.importInput as HTMLInputElement).click();
    },
    importCSV(): void {
      const { files } = this.$refs.importInput as HTMLInputElement;

      if (!files || !files.length || !files[0].name.endsWith('.csv')) {
        return;
      }

      this.importLoading = true;

      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = async () => {
        const result = reader.result as string;

        nodecg.sendMessage('importCSV', result.trim());

        // 1 second timeout so the user can see stuff happening
        setTimeout(() => {
          this.importLoading = false;
        }, 1000);
      };
    },
    async exportCSV(): Promise<void> {
      this.exportLoading = true;

      const result = await nodecg.sendMessage('exportCSV');
      const element = document.createElement('a');

      element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(result)}`);
      element.setAttribute('download', 'tweetr_data.csv');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      this.exportLoading = false;
    },
  },
});
</script>

<template>
  <v-app>
    <v-btn block @click="setAutotweet(false)"
           color="red-darken-4" v-if="settings.autoTweet">Disable Auto Tweet</v-btn>
    <v-btn block @click="setAutotweet(true)" v-else>Enable Auto Tweet</v-btn>

    <v-text-field type="number" label="Countdown Time" v-model="countdownTime" />

    <v-btn block @click="startImportCSV" :loading="importLoading">Import CSV</v-btn>
    <v-btn block @click="exportCSV" :loading="exportLoading">Export Tweets</v-btn>

    <input type="file" accept=".csv" ref="importInput" @change="importCSV"/>
  </v-app>
</template>

<style scoped>
input[type="file"] {
  display: none;
}

.v-btn {
  margin-bottom: 15px;
}
</style>
