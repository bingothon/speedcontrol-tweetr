/* eslint-disable max-len */
// regex based on: https://atproto.com/specs/handle#handle-identifier-syntax
export const mentionRegex = /[$|\W](@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)/g;

export const urlRegex = /[$|\W](https?:\/\/(www\.)?[-a-zA-Z0-9@:%._x+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*[-a-zA-Z0-9@%_+~#//=])?)/g;

export const hashtagRegex = /[$|\W](#[a-zA-Z0-9_-]+)/g;

export const VIDEO_MAX_SIZE = 50000000;
export const IMAGE_MAX_SIZE = 1000000;
