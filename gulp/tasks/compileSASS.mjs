import gulp from 'gulp';
import {config} from '../config.mjs';
import {plugins} from '../plugins.mjs';
import autoprefixer from 'gulp-autoprefixer';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);

/**
 * Обычно он один, потому пока беру путь напрямую
 */
const styleFile = 'system.css' //plugins.basename(config.systemVTT.styles[0]);

/**
 * Сборка SASS стилей в CSS
 * @returns 
 */
export const compileSASS = () => {
  return gulp.src(`${config.src.styles}/index.sass`)
    .on('error', plugins.notify.onError(function(err) {
        return {
          title: "compileSASS",
          message: err.message
        }
    }))
    .pipe(autoprefixer())
    .pipe(sass({
      errorLogToConsole: true,
      outputStyle: 'compressed'
    }))
    .on('error', console.error.bind(console))
    .pipe(plugins.rename(styleFile))
    .pipe(gulp.dest(config.build.styles));
};