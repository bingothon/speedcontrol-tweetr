/* eslint-disable global-require */

// This must go first so we can use module aliases!
/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('module-alias').addAlias('@tweetr', require('path').join(__dirname, '.'));

import type NodeCGTypes from '@nodecg/types';
import { Configschema } from '@tweetr/types/schemas';
import { set } from './util/nodecg';

export = (nodecg: NodeCGTypes.ServerAPI<Configschema>): void => {
  /**
   * Because of how `import`s work, it helps to use `require`s to force
   * things to be loaded *after* the NodeCG context is set.
   */
  set(nodecg);
  require('./tweetrExtension');
};
