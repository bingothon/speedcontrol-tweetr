export interface TweetOptions<ID> {
  imageData: ID;
}

interface ITwitterClient<ID> {
  uploadMedia(file: string): Promise<ID>;
  tweet(text: string, params: TweetOptions<ID> | undefined): Promise<void>;
}

export default ITwitterClient;
