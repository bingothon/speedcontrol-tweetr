/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('module-alias').addAlias('@tweetr', require('path').join(__dirname, '.'));

import BlueskyApiClient from '@tweetr/bluesky/BlueskyApiClient';

const client = new BlueskyApiClient({
  accessToken: '',
  accessTokenSecret: '',
  apiKey: '',
  apiSecret: '',
  bluesky: {
    identifier: '',
    password: '',
  },
  obs: { gameLayout: '' },
  useDummyTwitterClient: false,
  useEsaLayouts: false,
});

// client.uploadMedia('/home/duncte123/Downloads/riek face.jpg')
//   .then((imageData) => {
//     client.tweet('AAAAAAAA', { imageData }).then((data) => console.log(data));
//   });

client.parseFacets(
  'Hello @world.bsky.app, I like @im.going-g.host!! cheese :) '
  + 'prefix https://example.com/index.html http://bsky.app suffix This is a #test tweet #bluesky',
)
  .then((facets) => {
    console.log(JSON.stringify(facets, null, 2));
  });
