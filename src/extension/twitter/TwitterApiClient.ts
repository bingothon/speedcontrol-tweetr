import { Configschema } from '@tweetr/types/schemas';
import { SendTweetV2Params, TwitterApi } from 'twitter-api-v2';
import ITwitterClient, { TweetOptions } from '@tweetr/base/ITwitterClient';

export default class TwitterApiClient implements ITwitterClient<string> {
  private twitterApi: TwitterApi;

  constructor(config: Configschema) {
    this.twitterApi = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecret,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });
  }

  async tweet(text: string, params: TweetOptions<string> | undefined): Promise<void> {
    const mediaData: SendTweetV2Params | undefined = params ? {
      media: {
        media_ids: [
          params.imageData,
        ],
      },
    } : undefined;

    await this.twitterApi.v2.tweet(text, mediaData);
  }

  async uploadMedia(file: string): Promise<string> {
    return this.twitterApi.v1.uploadMedia(file);
  }
}
