<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CountdownTimer } from '@tweetr/types/schemas';

export default defineComponent({
  emits: ['tweetNow'],
  props: {
    countdownTimer: {
      type: Object as PropType<CountdownTimer>,
      required: true,
    },
  },
});
</script>

<template>
  <v-btn block disabled v-if="countdownTimer.countdownActive">
    Tweeting in {{ countdownTimer.countdown }}s
  </v-btn>
  <v-btn block v-else-if="countdownTimer.sendTweet" disabled>
    Tweet Sent
  </v-btn>
  <v-btn block v-else @click="$emit('tweetNow')">Tweet</v-btn>
</template>
