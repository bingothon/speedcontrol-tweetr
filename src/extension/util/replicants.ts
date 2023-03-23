/* eslint-disable max-len */

import type { CountdownTimer, ExampleReplicant, Settings, TweetData } from '@tweetr/types/schemas';
import { RunDataArray, RunFinishTimes } from 'speedcontrol-util/types';
import { speedcontrolBundle } from '@tweetr/util/bundles';
import { RunDataActiveRunSurrounding } from 'speedcontrol-util/types/speedcontrol/schemas';
import { get as nodecg } from './nodecg';

/**
 * This is where you can declare all your replicant to import easily into other files,
 * and to make sure they have any correct settings on startup.
 */

// Replicants from other bundles
export const runDataActiveRun = nodecg().Replicant<RunDataArray>('runDataActiveRun', speedcontrolBundle);
export const runDataArray = nodecg().Replicant<RunDataArray>('runDataArray', speedcontrolBundle);
export const runDataActiveRunSurrounding = nodecg().Replicant<RunDataActiveRunSurrounding>('runDataActiveRunSurrounding', speedcontrolBundle);
export const runFinishTimes = nodecg().Replicant<RunFinishTimes>('runFinishTimes', speedcontrolBundle);

// Our replicants
export const exampleReplicant = nodecg().Replicant<ExampleReplicant>('exampleReplicant', {
  persistent: false,
});
export const tweetData = nodecg().Replicant<TweetData>('tweetData', {
  defaultValue: {},
});
export const selectedRunId = nodecg().Replicant<string>('selectedRunId');
export const settings = nodecg().Replicant<Settings>('settings', {
  defaultValue: {
    autoTweet: false,
    countdown: 60,
  },
});
export const countdownTimer = nodecg().Replicant<CountdownTimer>('countdownTimer', {
  persistent: false,
  defaultValue: {
    countdownActive: false,
    cancelTweet: false,
    sendTweet: false,
    countdown: -1,
  },
});
