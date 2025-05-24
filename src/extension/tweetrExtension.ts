import { get as nodecg } from '@tweetr/util/nodecg';
import { TweetData } from '@tweetr/types/schemas';
import {
  countdownTimer,
  runDataActiveRun,
  runDataActiveRunSurrounding,
  runDataArray,
  runFinishTimes,
  selectedRunId,
  settings,
  tweetData,
} from '@tweetr/util/replicants';
import { layoutsBundle } from '@tweetr/util/bundles';
import { RunData } from 'speedcontrol-util/types';
import ITwitterClient, { TweetOptions } from '@tweetr/base/ITwitterClient';
import TwitterApiClient from '@tweetr/twitter/TwitterApiClient';
import DummyTwitterClient from '@tweetr/twitter/DummyTwitterClient';
import type NodeCGTypes from '@nodecg/types';
import Papa from 'papaparse';
import BlueskyApiClient from '@tweetr/bluesky/BlueskyApiClient';
import { MediaData as BussyPics } from '@tweetr/bluesky/types';

let buttonTimer: NodeJS.Timeout | undefined;

const config = nodecg().bundleConfig;
const twitterClient: ITwitterClient<string> = config.useDummyTwitterClient
  ? new DummyTwitterClient() : new TwitterApiClient(config);
const blueskyClient: ITwitterClient<BussyPics> = config.useDummyTwitterClient
  ? new DummyTwitterClient() : new BlueskyApiClient(config);

setTimeout(() => {
  clearInterval(buttonTimer);
  countdownTimer.value = {
    countdownActive: false,
    cancelTweet: false,
    sendTweet: false,
    countdown: -1,
  };
}, 1000);

function getMediaPath(mediaName: string): string {
  return `./assets/speedcontrol-tweetr/media/${mediaName}`;
}

async function sendTweet(): Promise<void> {
  clearInterval(buttonTimer);
  const data = tweetData.value[selectedRunId.value];

  if (!data || !data.content) {
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
    let twitterImageData: TweetOptions<string> | undefined;
    let bussyImageData: TweetOptions<BussyPics> | undefined;

    if (data.media && data.media !== 'None') {
      const mediaPath = getMediaPath(data.media);
      const blueskyImageData = await blueskyClient.uploadMedia(mediaPath);
      const mediaId = await twitterClient.uploadMedia(mediaPath);

      twitterImageData = {
        imageData: mediaId,
      };
      bussyImageData = {
        imageData: blueskyImageData,
      };
    }

    // const content = `Automated production test: ${Date.now()}, please ignore.\n${data.content}`;
    const { content } = data;

    await blueskyClient.tweet(content, bussyImageData);
    await twitterClient.tweet(content, twitterImageData);

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
    countdownTimer.value = {
      ...countdownTimer.value,
      countdownActive: true,
      countdown: time,
    };
    if (time <= 0) {
      clearInterval(buttonTimer);
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
  Run: string;
  Category: string;
  Runners: string;
  Tweet: string;
  MediaFilename: string;
  [k: string]: unknown;
};

async function importCSV(val: string, ack: NodeCGTypes.Acknowledgement | undefined): Promise<void> {
  const {data} = Papa.parse<string[]>(val);
  let headers: string[];
  
  let csvData: CSVData[] = [];
  
  data.forEach((row) => {
    if (!headers) {
      headers = row;
    } else {
      let record: CSVData = {
        ID: '',
        Run: '',
        Category: '',
        Runners: '',
        Tweet: '',
        MediaFilename: ''
      };
      
      row.forEach((value, index) => {
        record[headers[index]] = value;
      });
      
      csvData.push(record);
    }
  })
  
  for (let i = 0; i < csvData.length; i += 1) {
    const row = csvData[i];
    
    // We are missing properties so we skip it
    if (Object.keys(row).length < 5) {
      // eslint-disable-next-line no-continue
      continue;
    }
    
    console.log(row);
    
    tweetData.value[row.ID] = {
      game: row.Run,
      category: row.Category,
      content: row.Tweet, // index 3 is runner names
      media: row.MediaFilename || null,
    };
  }
  
  if (ack && !ack.handled) {
    ack(null);
  }
}

function createCSV(ack: NodeCGTypes.Acknowledgement | undefined): void {
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
      Run: runData.game || 'missingno',
      Category: runData.category || 'unknown%',
      Runners: runners.join(', '),
      Tweet: tweetData.value[run].content,
      MediaFilename: (tweetData.value[run].media === 'None') ? '' : tweetData.value[run].media || '',
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

  nodecg().log.debug('Arrays synced', updatedData);

  tweetData.value = updatedData;
}

if (config.useEsaLayouts) {
  nodecg().listenFor('obs:startingTransition', layoutsBundle, (data) => {
    if (data.scene === config.obs.gameLayout && settings.value.autoTweet) {
      startCountdown();
    }
  });
}

nodecg().listenFor('sendTweet', () => sendTweet());
nodecg().listenFor('cancelTweet', () => cancelTweet());
nodecg().listenFor('exportCSV', (value, callback) => createCSV(callback));
nodecg().listenFor('importCSV', (value, callback) => importCSV(value, callback));

runDataArray.on('change', (newVal) => syncArrays(newVal));
runDataActiveRun.on('change', (newVal, oldVal) => {
  let newRunId = '';
  let oldRunId = '';
  
  if (newVal) {
    newRunId = newVal.id;
  } else {
    const runs = runDataArray.value;

    if (runs.length) {
      newRunId = runs[0].id;
    }
  }
  
  if (oldVal) {
    oldRunId = oldVal.id;
  } else {
    const runs = runDataArray.value;
    
    if (runs.length) {
      oldRunId = runs[0].id;
    }
  }
  
  if (!config.useEsaLayouts && newRunId != oldRunId && settings.value.autoTweet) {
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
