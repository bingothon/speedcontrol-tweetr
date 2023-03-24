<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CountdownTimer } from '@tweetr/types/schemas';

export default defineComponent({
  emits: ['editClicked', 'cancelClicked'],
  props: {
    countdownTimer: {
      type: Object as PropType<CountdownTimer>,
      required: true,
    },
  },
});
</script>

<template>
  <v-btn block
         color="red-darken-4"
         @click="$emit('cancelClicked')"
         :disabled="countdownTimer.sendTweet"
         v-if="countdownTimer.countdownActive || countdownTimer.sendTweet"
  >
    Cancel
  </v-btn>
  <v-btn block v-else @click="$emit('editClicked')">
    Edit
  </v-btn>
</template>
