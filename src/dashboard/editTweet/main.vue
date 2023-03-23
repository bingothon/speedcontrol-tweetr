<script lang="ts">
import { defineComponent } from 'vue';
import { useHead } from '@vueuse/head';
import { useReplicant, useAssetReplicant } from 'nodecg-vue-composable';
import { RunDataArray } from 'speedcontrol-util/types';

export default defineComponent({
  setup() {
    useHead({ title: 'Edit Tweet' });

    const runDataArray = useReplicant<RunDataArray>('runDataArray', 'nodecg-speedcontrol');
    const tweetData = useReplicant('tweetData', 'speedcontrol-tweetr');
    const mediaData = useAssetReplicant('media', 'speedcontrol-tweetr');
    const selectedRunId = useReplicant('selectedRunId', 'speedcontrol-tweetr');

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
});
</script>

<template>
  <v-app>
    <v-text-field label="Run" readonly model-value="test-123"></v-text-field>
  </v-app>
</template>
