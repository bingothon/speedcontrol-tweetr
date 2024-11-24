import ITwitterClient, { TweetOptions } from '@tweetr/base/ITwitterClient';
import axios from 'axios';
import { Configschema } from '@tweetr/types/schemas';
import { readFile, stat } from 'fs/promises';
import { get as nodecg } from '@tweetr/util/nodecg';
import {
  BlueskyFacetData,
  BlueskyHashtagData,
  BlueskyMentionData,
  BlueskySession,
  BlueskyUpdateResult,
  BlueskyUrlData,
  MediaData,
} from '@tweetr/bluesky/types';
import { hashtagRegex, IMAGE_MAX_SIZE, mentionRegex, urlRegex, VIDEO_MAX_SIZE } from '@tweetr/bluesky/constants';
import utf8 from 'utf8';

export default class BlueskyApiClient implements ITwitterClient<MediaData> {
  private bussyClient = axios.create({
    baseURL: 'https://bsky.social',
    headers: {
      'User-Agent': 'BussyClient +github.com/bsgmarathon/speedcontrol-tweetr',
    },
  });
  private session: BlueskySession | null = null;
  // private encoder = new TextEncoder();
  // private decoder = new TextDecoder();

  constructor(
    private config: Configschema,
  ) {
    this.login().then((loginSes) => {
      this.session = loginSes;

      // Refresh every 30 mins
      setInterval(async () => {
        try {
          this.session = await this.refreshToken();
        } catch (e: unknown) {
          nodecg().log.error('Error refreshing Bluesky token:', e);
        }
      }, 30 * 60 * 1000);
    });
  }

  async tweet(text: string, params: TweetOptions<MediaData> | undefined): Promise<void> {
    if (this.session === null) {
      this.session = await this.login();
    }

    const facets = await this.parseFacets(text);
    const created = (new Date()).toISOString();
    const postData = {
      $type: 'app.bsky.feed.post',
      text,
      createdAt: created,
      embed: params?.imageData,
      facets,
    };
    const collectionData = {
      repo: this.session?.did ?? '',
      collection: 'app.bsky.feed.post',
      record: postData,
    };

    const { data } = await this.bussyClient.post('/xrpc/com.atproto.repo.createRecord', collectionData, {
      headers: {
        Authorization: this.accessToken,
      },
    });

    nodecg().log.debug('Post create response', data);
  }

  async uploadMedia(file: string): Promise<MediaData> {
    const fileStat = await stat(file);
    const contentType = this.guessContentType(file);
    const fileType = contentType.split('/')[0];

    if (fileType === 'image' && fileStat.size > IMAGE_MAX_SIZE) {
      throw new Error(`Image too large :), got ${fileStat.size} bytes, ${IMAGE_MAX_SIZE} bytes maximum.`);
    } else if (fileType === 'video' && fileStat.size > VIDEO_MAX_SIZE) {
      throw new Error(`Video too large :), got ${fileStat.size} bytes, ${VIDEO_MAX_SIZE} bytes maximum.`);
    }

    if (this.session === null) {
      this.session = await this.login();
    }

    const fileBuff = await readFile(file);

    const { data } = await this.bussyClient.post<BlueskyUpdateResult>(
      '/xrpc/com.atproto.repo.uploadBlob',
      fileBuff,
      {
        headers: {
          Authorization: this.accessToken,
          'Content-Type': contentType,
        },
      },
    );

    nodecg().log.debug('Image upload response', data);

    // So turns out this does not work???
    // Keep getting "Video not found"
    // 11/10 platform
    // Documentation: https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json#L30
    // Yeah good luck
    if (fileType === 'video') {
      return {
        $type: 'app.bsky.embed.video',
        video: data.blob,
      };
    }

    return {
      $type: 'app.bsky.embed.images',
      images: [
        {
          alt: '',
          image: data.blob,
        },
      ],
    };
  }

  private get accessToken(): string {
    return `Bearer ${this.session?.accessJwt ?? ''}`;
  }

  private get refreshHeader(): string {
    return `Bearer ${this.session?.refreshJwt ?? ''}`;
  }

  private guessContentType(fileName: string): string {
    const ext = fileName.split('.')[2];

    switch (ext) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'mp4':
        return 'video/mp4';
      default:
        return 'application/octet-stream';
    }
  }

  private async login(): Promise<BlueskySession> {
    const { data } = await this.bussyClient.post<BlueskySession>('/xrpc/com.atproto.server.createSession', {
      identifier: this.config.bluesky.identifier,
      password: this.config.bluesky.password,
    });

    console.log(data);

    return data;
  }

  private async refreshToken(): Promise<BlueskySession> {
    const { data } = await this.bussyClient.post<BlueskySession>('/xrpc/com.atproto.server.refreshSession', null, {
      headers: {
        Authorization: this.refreshHeader,
      },
    });

    console.log(data);

    return data;
  }

  private async fetchTheStupidDid(handle: string): Promise<string | null> {
    try {
      const { data } = await this.bussyClient.get<{ did: string; }>('/xrpc/com.atproto.identity.resolveHandle', {
        params: {
          handle,
        },
      });

      return data.did;
    } catch (e: unknown) {
      return null;
    }
  }

  private parseMentions(message: string): BlueskyMentionData[] {
    const spans: BlueskyMentionData[] = [];
    const matches = message.matchAll(mentionRegex);

    // Iterators do not have forEach
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      const handle = match[1];
      const index = (match.index ?? 0) + 1;

      spans.push({
        start: index,
        end: index + handle.length,
        handle: utf8.decode(handle).substring(1), // strip off the '@'
      });
    }

    return spans;
  }

  private parseUrls(message: string): BlueskyUrlData[] {
    const spans: BlueskyUrlData[] = [];
    const matches = message.matchAll(urlRegex);

    // Iterators do not have forEach
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      const url = match[1];
      const index = (match.index ?? 0) + 1;

      spans.push({
        start: index,
        end: index + url.length,
        url: utf8.decode(url),
      });
    }

    return spans;
  }

  private parseHashtags(message: string): BlueskyHashtagData[] {
    const spans: BlueskyHashtagData[] = [];
    const matches = message.matchAll(hashtagRegex);

    // Iterators do not have forEach
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      const tag = match[1];
      const index = (match.index ?? 0) + 1;

      spans.push({
        start: index,
        end: index + tag.length,
        tag: utf8.decode(tag).substring(1), // strip off the '#'
      });
    }

    return spans;
  }

  async parseFacets(message: string): Promise<BlueskyFacetData[]> {
    // TODO: find a way to use TextEncoder/TextDecoder that are built-in
    const utf8Message = utf8.encode(message);
    const facets: BlueskyFacetData[] = [];
    const promises: Promise<unknown>[] = [];

    this.parseMentions(utf8Message).forEach((mention) => {
      // I hate this so much
      // I don't want to make a request for each mention found
      // WHY DO YOU WORK THIS WAY
      promises.push(
        this.fetchTheStupidDid(mention.handle)
          .then(
            (did) => {
              if (did) {
                facets.push({
                  index: {
                    byteStart: mention.start,
                    byteEnd: mention.end,
                  },
                  features: [
                    { $type: 'app.bsky.richtext.facet#mention', did },
                  ],
                });
              }
            },
          ),
      );
    });

    this.parseUrls(utf8Message).forEach((url) => {
      facets.push({
        index: {
          byteStart: url.start,
          byteEnd: url.end,
        },
        features: [
          { $type: 'app.bsky.richtext.facet#link', uri: url.url },
        ],
      });
    });

    this.parseHashtags(utf8Message).forEach((hashtag) => {
      facets.push({
        index: {
          byteStart: hashtag.start,
          byteEnd: hashtag.end,
        },
        features: [
          { $type: 'app.bsky.richtext.facet#tag', tag: hashtag.tag },
        ],
      });
    });

    await Promise.all(promises);

    return facets;
  }
}
