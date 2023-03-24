import { Configschema } from '@tweetr/types/schemas';
import { SendTweetV1Params } from 'twitter-api-v2/dist/types';
import { TwitterApi } from 'twitter-api-v2';
import ITwitterClient from './ITwitterClient';

export default class TwitterApiClient implements ITwitterClient {
  private twitterApi: TwitterApi;

  constructor(config: Configschema) {
    this.twitterApi = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecret,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });
  }

  async tweet(text: string, params: Partial<SendTweetV1Params> | undefined): Promise<void> {
    await this.twitterApi.v1.tweet(text, params);
  }

  async uploadMedia(file: string): Promise<string> {
    return this.twitterApi.v1.uploadMedia(file);
  }
}
