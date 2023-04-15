import { get as nodecg } from '@tweetr/util/nodecg';
import { Configschema, TweetData } from '@tweetr/types/schemas';
import {
  countdownTimer, runDataActiveRun, runDataActiveRunSurrounding,
  runDataArray, runFinishTimes, selectedRunId, settings, tweetData,
} from '@tweetr/util/replicants';
import { layoutsBundle } from '@tweetr/util/bundles';
import { RunData } from 'speedcontrol-util/types';
import { SendTweetV2Params } from 'twitter-api-v2/dist/types';
import { ListenForCb } from 'nodecg-types/types/lib/nodecg-instance';
import ITwitterClient from '@tweetr/twitter/ITwitterClient';
import TwitterApiClient from '@tweetr/twitter/TwitterApiClient';
import DummyTwitterClient from '@tweetr/twitter/DummyTwitterClient';
import Papa from 'papaparse';

let buttonTimer: NodeJS.Timer | undefined;

const config = nodecg().bundleConfig as Configschema;
const twitterClient: ITwitterClient = config.useDummyTwitterClient
  ? new DummyTwitterClient() : new TwitterApiClient(config);

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

  if (!data.content) {
    nodecg().log.warn(`Skipping tweet for "${data.game}, ${data.category}" due to missing content`);
    return;
  }

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
    let payloadObj: Partial<SendTweetV2Params> | undefined;

    if (data.media && data.media !== 'None') {
      const mediaId = await twitterClient
        .uploadMedia(`./assets/speedcontrol-tweetr/media/${data.media}`);

      payloadObj = {
        media: {
          media_ids: [mediaId],
        },
      };
    }

    await twitterClient.tweet(data.content, payloadObj);

    countdownTimer.value = {
      ...countdownTimer.value,
      countdownActive: false,
      sendTweet: true,
    };
  } catch (e: unknown) {
    const run = runDataArray.value.find((r) => r.id === selectedRunId.value)
      || { game: 'missingno', category: '' };
    nodecg().log.warn(
      `Error posting tweet. Your tweet is either blank, invalid, or a duplicate. Run: ${
        run.game} ${run.category}`,
    );
    // eslint-disable-next-line no-console
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
    time -= 1;
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

type CSVData = {
  ID: string;
  Game: string;
  Category: string;
  'Runner(s)': string;
  'Tweet Content': string;
  Media: string;
};

async function importCSV(val: string, ack: ListenForCb | undefined): Promise<void> {
  const { data } = Papa.parse<string[]>(val);

  // we start at 1 to skip the header row
  for (let i = 1; i < data.length; i += 1) {
    const row = data[i];

    // We are missing properties so we skip it
    if (row.length < 6) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const split = row[5].split('/');
    const mediaName = split[split.length - 1];

    tweetData.value[row[0]] = {
      game: row[1],
      category: row[2],
      content: row[4], // index 3 is runner names
      media: mediaName || null,
    };
  }

  if (ack && !ack.handled) {
    ack(null);
  }
}

function createCSV(ack: ListenForCb | undefined): void {
  const array: CSVData[] = [];

  Object.keys(tweetData.value).forEach((run) => {
    const runData = runDataArray.value.find((x) => x.id === run);

    if (!runData) {
      return;
    }

    const runners = runData.teams.flatMap(
      (team) => team.players.map((r) => r.name),
    );

    array.push({
      ID: run,
      Game: runData.game || 'missingno',
      Category: runData.category || 'unknown%',
      'Runner(s)': runners.join(', '),
      'Tweet Content': tweetData.value[run].content,
      Media: (tweetData.value[run].media === 'None') ? '' : tweetData.value[run].media || '',
    });
  });

  if (ack && !ack.handled) {
    ack(null, Papa.unparse<CSVData>(array));
  }
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
runDataActiveRun.on('change', (newVal) => {
  let newRunId = '';

  if (newVal) {
    newRunId = newVal.id;
  } else {
    const runs = runDataArray.value;

    if (runs.length) {
      newRunId = runs[0].id;
    }
  }

  if (!config.useEsaLayouts && newRunId !== selectedRunId.value && settings.value.autoTweet) {
    startCountdown();
  }

  if (newRunId !== selectedRunId.value) {
    countdownTimer.value = {
      cancelTweet: false,
      countdownActive: false,
      sendTweet: false,
      countdown: 0,
    };
  }

  selectedRunId.value = newRunId;
});

selectedRunId.on('change', () => {
  if (countdownTimer.value.countdownActive) {
    cancelTweet();
  }
});
