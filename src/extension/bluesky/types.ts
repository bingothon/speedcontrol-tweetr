export interface BlueskySession {
  accessJwt: string;
  refreshJwt: string;
  did: string;
}

export interface BlueskyUpdateResult {
  blob: {
    $type: 'blob';
    ref: {
      $link: string;
    };
    mimeType: string;
    size: number;
  };
}

export interface BlueskyImageData {
  $type: 'app.bsky.embed.images';
  images: {
    alt: string;
    image: BlueskyUpdateResult['blob'];
  }[];
}

export interface BlueskySpanData {
  start: number;
  end: number;
}

export interface BlueskyMentionData extends BlueskySpanData {
  handle: string;
}

export interface BlueskyUrlData extends BlueskySpanData {
  url: string;
}

export interface BlueskyHashtagData extends BlueskySpanData {
  tag: string;
}

type FacetFeature =
  { $type: 'app.bsky.richtext.facet#mention'; did: string; } |
  { $type: 'app.bsky.richtext.facet#link'; uri: string; } |
  { $type: 'app.bsky.richtext.facet#tag'; tag: string; };

export interface BlueskyFacetData {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: FacetFeature[];
}
