import gulp from 'gulp';
import {config} from '../config.mjs';
import {plugins} from '../plugins.mjs';

import webp from 'gulp-webp';
//import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';

/**
 * Конвертирует изображения в формат WEBP
 */
export const convertImages = () => {
  return gulp.src(`${config.src.assets}/**/*.{png,jpeg,jpg,webp}`, {base: './'})
    //.pipe(cache(imagemin()))
    .pipe(webp())
    .pipe(gulp.dest(`${config.build.assets}/`));
};