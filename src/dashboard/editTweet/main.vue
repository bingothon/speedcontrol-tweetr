<script lang="ts">
import { defineComponent } from 'vue';
import { useHead } from '@vueuse/head';
import { useReplicant, useAssetReplicant } from 'nodecg-vue-composable';
import { RunDataArray } from 'speedcontrol-util/types';
import { TweetData } from '@tweetr/types/schemas';

export default defineComponent({
  setup() {
    useHead({ title: 'Edit Tweet' });

    const runDataArray = useReplicant<RunDataArray>('runDataArray', 'nodecg-speedcontrol');
    const tweetData = useReplicant<TweetData>('tweetData', 'speedcontrol-tweetr');
    const mediaData = useAssetReplicant('media', 'speedcontrol-tweetr');
    const selectedRunId = useReplicant<string>('selectedRunId', 'speedcontrol-tweetr');

    if (!runDataArray || !tweetData || !mediaData || !selectedRunId) {
      throw new Error('Missing replicants');
    }

    return {
      runDataArray,
      tweetData,
      mediaData,
      selectedRunId,
    };
  },
  created(): void {
    document.addEventListener('dialog-confirmed', () => {
      if (this.tweetDataComputed?.media === 'None') {
        this.tweetDataComputed.media = null;
      }

      this.tweetData.save();
    });

    document.addEventListener('dialog-dismissed', () => {
      this.tweetData.revert();
    });
  },
  computed: {
    runTitle(): string {
      const runInfo = this.runDataArray.data?.find((run) => run.id === this.selectedRunId.data);

      if (!runInfo) {
        return 'missingno';
      }

      return `${runInfo.game}, ${runInfo.category}`;
    },
    tweetDataComputed(): TweetData['runId'] {
      const base = this.tweetData.data?.[this.selectedRunId.data || ''];

      if (!base) {
        // Dummy object
        return {
          category: '', content: '', game: '', media: 'None',
        };
      }

      base.media = base.media || 'None';

      return base;
    },
    mediaForDropdown(): string[] {
      const bases = this.mediaData.map((asset) => asset.base);

      return [
        'None',
        ...bases,
      ];
    },
  },
});
</script>

<template>
  <v-app>
    <v-text-field label="Run" readonly :model-value="runTitle"></v-text-field>
    <v-textarea label="Tweet" v-model="tweetDataComputed.content"/>
    <v-select
      label="Media"
      v-model="tweetDataComputed.media"
      :items="mediaForDropdown"
    />
  </v-app>
</template>
