<script lang="ts">
import { defineComponent } from 'vue';
import { useReplicant } from 'nodecg-vue-composable';
import { RunDataArray } from 'speedcontrol-util/types';
import { CountdownTimer } from '@tweetr/types/schemas';
import TweetButton from './components/TweetButton.vue';
import CancelEditButton from './components/CancelEditButton.vue';
import { useHead } from '@vueuse/head';

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

    if (!runDataArray || !selectedRunId || !countdownTimer) {
      throw new Error('A replicant is missing');
    }

    return {
      runDataArray,
      selectedRunId,
      countdownTimer,
    };
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
    <v-container>
      <v-select
        v-model="selectedRunId.data"
        label="Run"
        item-value="id"
        item-title="game"
        :items="runDataArray.data"
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
      <p>{{ selectedRunId.data }}</p>
    </v-container>
  </v-app>
</template>
