import { get as nodecg } from '@tweetr/util/nodecg';
import ITwitterClient, { TweetOptions } from '@tweetr/base/ITwitterClient';

export default class DummyTwitterClient implements ITwitterClient<string> {
  async tweet(text: string, params: TweetOptions<string> | undefined): Promise<void> {
    nodecg().log.info(`Dummy tweet: ${text}`);
  }

  async uploadMedia(file: string): Promise<string> {
    return 'Dummy media :D';
  }
}
