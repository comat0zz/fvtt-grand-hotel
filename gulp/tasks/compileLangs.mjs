import gulp from 'gulp';
import {config} from '../config.mjs';
import {plugins} from '../plugins.mjs';

const langs = config.systemVTT.languages;
/**
 * Сборка языковых файлов, разбитых на множество для удобства, 
 * в единые файлы, указанные в system.json
 * Актуально только на больших проектов, когда языковой файл
 * получается слишком громадный.
 * @returns 
 */
export const compileLangs = () => {
    return langs.map(function(el){
      return gulp.src(`${config.src.langs}/${el['lang']}/*.json`)
        .on('error', plugins.notify.onError(function(err) {
          return {
            title: "compileLangs",
            message: err.message
          }
        }))
        .pipe(plugins.merge({
          fileName: el['path'],
          jsonSpace: "  "
        }))
        .pipe(gulp.dest(`${config.rootFldr}/`));
    })
};