<script lang="ts">
import { defineComponent } from 'vue';
import { useReplicant } from 'nodecg-vue-composable';

export default defineComponent({
  setup() {
    // TODO: is this used anywhere else?
    const speedcontrolBundle = 'nodecg-speedcontrol';
    // TODO: typing & possibly undefined?
    const runDataArray = useReplicant<any[]>('runDataArray', speedcontrolBundle)!!;
    const selectedRunId = useReplicant<string>('selectedRunId', 'speedcontrol-tweetr')!!;

    return {
      runDataArray,
      selectedRunId,
    };
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
			<template #item="{ props, item }" >
				<v-list-item v-bind="props" title="">
					{{ item.raw.game }}, {{ item.raw.category }}
				</v-list-item>
			</template>
			<template v-slot:selection="{ item }">
				<span>{{ item.raw.game }}, {{ item.raw.category }}</span>
			</template>
		</v-select>
		<p>{{ selectedRunId.data }}</p>
	</v-container>
  </v-app>
</template>
