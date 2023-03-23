import { get as nodecg } from '@tweetr/util/nodecg';
import { Configschema, TweetData } from '@tweetr/types/schemas';
import {
  countdownTimer,
  runDataActiveRunSurrounding,
  runDataArray, runFinishTimes,
  selectedRunId,
  settings,
  tweetData,
} from '@tweetr/util/replicants';
import { layoutsBundle } from '@tweetr/util/bundles';
import { RunData } from 'speedcontrol-util/types';
import { TwitterApi } from 'twitter-api-v2';
import { SendTweetV1Params } from 'twitter-api-v2/dist/types';
import { ListenForCb } from 'nodecg-types/types/lib/nodecg-instance';

let buttonTimer: NodeJS.Timer | undefined;

const config = nodecg().bundleConfig as Configschema;

const twitterClient = new TwitterApi({
  appKey: config.apiKey,
  appSecret: config.apiSecret,
  accessToken: config.accessToken,
  accessSecret: config.accessTokenSecret,
});

setTimeout(() => {
  clearInterval(buttonTimer);
  countdownTimer.value = {
    countdownActive: false,
    cancelTweet: false,
    sendTweet: false,
    countdown: -1,
  };
}, 1000);

async function sendTweet(): Promise<void> {
  clearInterval(buttonTimer);
  const data = tweetData.value[selectedRunId.value];

  if (data.content.includes('!lastRunTime')) {
    const prev = runDataActiveRunSurrounding.value.previous;

    if (prev) {
      try {
        data.content = data.content.replace('!lastRunTime', runFinishTimes.value[prev].time);
      } catch {
        nodecg().log.warn('The last run either doesn\'t exist or doesn\'t have a final time.');
      }
    } else {
      nodecg().log.warn('The last run either doesn\'t exist or doesn\'t have a final time.');
    }
  }

  try {
    let payloadObj: Partial<SendTweetV1Params> | undefined;

    if (data.media && data.media !== 'None') {
      const mediaId = await twitterClient.v1
        .uploadMedia(`./assets/speedcontrol-tweetr/media/${data.media}`);

      payloadObj = {
        media_ids: [mediaId],
      };
    }

    await twitterClient.v1.tweet(data.content, payloadObj);
  } catch (e: any) {
    const run = runDataArray.value.find((r) => r.id === selectedRunId.value)
      || { game: 'missingno', category: '' };
    nodecg().log.warn(
      `Error posting tweet. Your tweet is either blank, invalid, or a duplicate. Run: ${
        run.game} ${run.category}`,
    );
    console.error(e);
  }
}

function startCountdown(): void {
  clearInterval(buttonTimer);

  let time = settings.value.countdown;
  countdownTimer.value = {
    countdownActive: true,
    cancelTweet: false,
    sendTweet: false,
    countdown: time,
  };

  buttonTimer = setInterval(() => {
    // eslint-disable-next-line no-plusplus
    time--;
    countdownTimer.value.countdown = time;
    if (time <= 0) {
      sendTweet();
    }
  }, 1000);
}

function cancelTweet(): void {
  clearInterval(buttonTimer);
  countdownTimer.value = {
    countdownActive: false,
    cancelTweet: true,
    sendTweet: false,
    countdown: -1,
  };
}

async function importCSV(val: any, cb: ListenForCb | undefined): Promise<void> {
  //
}

function createCSV(cb: ListenForCb | undefined): void {
  //
}

function syncArrays(runArray: RunData[]): void {
  const currentData = tweetData.value;
  const updatedData: TweetData = {};

  runArray.forEach((run) => {
    if (currentData[run.id] === undefined) {
      updatedData[run.id] = {
        game: run.game || 'Unknown Game',
        category: run.category || 'Unknown Category',
        content: '',
        media: null,
      };
    } else {
      updatedData[run.id] = currentData[run.id];
    }
  });

  tweetData.value = updatedData;
}

if (config.useEsaLayouts) {
  nodecg().listenFor('obsChangeScene', layoutsBundle, ({ scene }) => {
    if (scene === config.obs.gameLayout && settings.value.autoTweet) {
      startCountdown();
    }
  });
}

nodecg().listenFor('sendTweet', () => sendTweet());
nodecg().listenFor('cancelTweet', () => cancelTweet());
nodecg().listenFor('exportCSV', (value, callback) => createCSV(callback));
nodecg().listenFor('importCSV', (value, callback) => importCSV(value, callback));

runDataArray.on('change', (newVal) => syncArrays(newVal));

selectedRunId.on('change', () => {
  if (countdownTimer.value.countdownActive) {
    cancelTweet();
  }
});
