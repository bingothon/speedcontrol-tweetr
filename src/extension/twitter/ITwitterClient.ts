import { SendTweetV2Params } from 'twitter-api-v2/dist/types';

export default interface ITwitterClient {
  uploadMedia(file: string): Promise<string>;
  tweet(text: string, params: Partial<SendTweetV2Params> | undefined): Promise<void>;
}
