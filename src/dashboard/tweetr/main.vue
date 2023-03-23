<script lang="ts">
import { defineComponent } from 'vue';
import { useReplicant } from 'nodecg-vue-composable';
import { RunDataArray } from 'speedcontrol-util/types';
import { CountdownTimer, TweetData } from '@tweetr/types/schemas';
import { useHead } from '@vueuse/head';
import TweetButton from './components/TweetButton.vue';
import CancelEditButton from './components/CancelEditButton.vue';

export default defineComponent({
  components: {
    CancelEditButton,
    TweetButton,
  },
  setup() {
    useHead({ title: 'Tweetr' });

    // TODO: is this used anywhere else?
    const speedcontrolBundle = 'nodecg-speedcontrol';
    const runDataArray = useReplicant<RunDataArray>('runDataArray', speedcontrolBundle);
    const selectedRunId = useReplicant<string>('selectedRunId', 'speedcontrol-tweetr');
    const countdownTimer = useReplicant<CountdownTimer>('countdownTimer', 'speedcontrol-tweetr');
    const tweetData = useReplicant<TweetData>('tweetData', 'speedcontrol-tweetr');

    if (!runDataArray || !selectedRunId || !countdownTimer || !tweetData) {
      throw new Error('A replicant is missing');
    }

    return {
      runDataArray,
      selectedRunId,
      countdownTimer,
      tweetData,
    };
  },
  computed: {
    currentRun(): string {
      return this.selectedRunId.data || '';
    },
    currentData(): TweetData['runId'] | null {
      return this.tweetData.data?.[this.currentRun] || null;
    },
  },
  methods: {
    sendTweetNow(): void {
      nodecg.sendMessage('sendTweet');
    },
    cancelTweet(): void {
      nodecg.sendMessage('cancelTweet');
    },
    openEditDialog(): void {
      nodecg.sendMessage('editTweet');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore bad types
      nodecg.getDialog('editTweet')?.open();
    },
  },
});
</script>

<template>
  <v-app>
    <!-- we save the replicant value to make sure that it updates -->
    <v-select
      v-model="selectedRunId.data"
      label="Run"
      item-value="id"
      item-title="game"
      :items="runDataArray.data"
      @update:modelValue="selectedRunId.save"
    >
      <template #item="{ props, item }">
        <v-list-item v-bind="props" title="">
          {{ item.raw.game }}, {{ item.raw.category }}
        </v-list-item>
      </template>
      <template v-slot:selection="{ item }">
        <span>{{ item.raw.game }}, {{ item.raw.category }}</span>
      </template>
    </v-select>
    <v-row v-if="countdownTimer.data">
      <v-col>
        <TweetButton :countdown-timer="countdownTimer.data" @tweet-now="sendTweetNow"/>
      </v-col>
      <v-col>
        <CancelEditButton
          :countdown-timer="countdownTimer.data"
          @cancel-clicked="cancelTweet"
          @edit-clicked="openEditDialog"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea label="Tweet" readonly :model-value="currentData?.content"/>
        <v-text-field label="Media" readonly :model-value="currentData?.media || 'None'" />
      </v-col>
    </v-row>
  </v-app>
</template>
