import notify from 'gulp-notify';
import merge from 'gulp-merge-json';
import debug from 'gulp-debug';
import rename from 'gulp-rename';
import { basename, dirname } from "node:path";

export const plugins = {
  notify: notify,
  merge: merge,
  debug: debug,
  rename:rename,
  basename:basename,
  dirname:dirname
};