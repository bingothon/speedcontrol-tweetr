/* eslint-disable class-methods-use-this */

import { get as nodecg } from '@tweetr/util/nodecg';
import { SendTweetV2Params } from 'twitter-api-v2/dist/types';
import ITwitterClient from './ITwitterClient';

export default class DummyTwitterClient implements ITwitterClient {
  async tweet(text: string, params: Partial<SendTweetV2Params> | undefined): Promise<void> {
    nodecg().log.info(`Dummy tweet: ${text}`);
  }

  async uploadMedia(file: string): Promise<string> {
    return 'Dummy media :D';
  }
}
