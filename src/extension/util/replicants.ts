/* eslint-disable max-len */

import type { CountdownTimer, Settings, TweetData } from '@tweetr/types/schemas';
import { RunDataActiveRun, RunDataArray, RunFinishTimes } from 'speedcontrol-util/types';
import { speedcontrolBundle } from '@tweetr/util/bundles';
import { RunDataActiveRunSurrounding } from 'speedcontrol-util/types/schemas';
import type NodeCGTypes from '@nodecg/types';
import { get as nodecg } from './nodecg';

/**
 * This is where you can declare all your replicant to import easily into other files,
 * and to make sure they have any correct settings on startup.
 */

// Replicants from other bundles
export const runDataActiveRun = nodecg().Replicant<RunDataActiveRun>('runDataActiveRun', speedcontrolBundle) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<RunDataActiveRun>;
export const runDataArray = nodecg().Replicant<RunDataArray>('runDataArray', speedcontrolBundle) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<RunDataArray>;
export const runDataActiveRunSurrounding = nodecg().Replicant<RunDataActiveRunSurrounding>('runDataActiveRunSurrounding', speedcontrolBundle) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<RunDataActiveRunSurrounding>;
export const runFinishTimes = nodecg().Replicant<RunFinishTimes>('runFinishTimes', speedcontrolBundle) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<RunFinishTimes>;

// Our replicants
export const tweetData = nodecg().Replicant<TweetData>('tweetData', {
  defaultValue: {},
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<TweetData>;
export const selectedRunId = nodecg().Replicant<string>('selectedRunId') as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<string>;
export const settings = nodecg().Replicant<Settings>('settings', {
  defaultValue: {
    autoTweet: false,
    countdown: 60,
  },
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<Settings>;
export const countdownTimer = nodecg().Replicant<CountdownTimer>('countdownTimer', {
  persistent: false,
  defaultValue: {
    countdownActive: false,
    cancelTweet: false,
    sendTweet: false,
    countdown: -1,
  },
}) as unknown as NodeCGTypes.ServerReplicantWithSchemaDefault<CountdownTimer>;
