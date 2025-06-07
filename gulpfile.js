import gulp from 'gulp';
import { config } from './gulp/config.mjs';


// tasks import
import {compileLangs} from './gulp/tasks/compileLangs.mjs';
import {compileSASS} from './gulp/tasks/compileSASS.mjs';
import {createBuild} from './gulp/tasks/createBuild.mjs';
import {convertImages} from './gulp/tasks/convertImages.mjs';


gulp.task('compileLangs', compileLangs);
gulp.task('compileSASS', compileSASS);
gulp.task('createBuild', createBuild);

gulp.task('convertImages', convertImages); // in dev

/**************************/
/*  Watches dirs          */
/**************************/
gulp.task('watch', function(){
 gulp.watch(config.watch.css, gulp.series(compileSASS));
 gulp.watch(config.watch.langs, gulp.series(compileLangs));
});