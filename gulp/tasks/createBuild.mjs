import gulp from 'gulp';
import {config} from '../config.mjs';
import {plugins} from '../plugins.mjs';

import zip from 'gulp-zip';

const buildDirs = [
  `${config.build.assets}/**/*`,
  `${config.build.styles}/**/*`,
  `${config.build.langs}/**/*`,
  `${config.build.packs}/**/*`,
  `${config.rootFldr}/libs/**/*`,
  `${config.rootFldr}/templates/**/*`,
  `${config.rootFldr}/esmodules/**/*`,
  `${config.rootFldr}/system.json`
]

/**
 * Создаёт архив с системой для заливки в релиз
 * @returns 
 */
export const createBuild = () => {
  return gulp.src(buildDirs, {base: './'})
    .pipe(zip(`${config.systemVTT.id}.zip`))
    .pipe(gulp.dest(`${config.rootFldr}/`));
};