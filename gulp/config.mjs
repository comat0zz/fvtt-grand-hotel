import fs from 'fs';

const rootFldr = '.';
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const srcFldr = `${rootFldr}/src`;
const systemVTT = JSON.parse(fs.readFileSync(`${rootFldr}/system.json`));

export const config = {
  rootFldr: rootFldr,
  srcFldr: srcFldr,

  isDevelopment: isDevelopment,
  systemVTT: systemVTT,

  build: {
    styles: `${rootFldr}/styles/`,
    packs:  `${rootFldr}/packs/`,
    assets: `${rootFldr}/assets/`,
    langs:  `${rootFldr}/lang/`
  },

  src: {
    styles: `${srcFldr}/sass/`,
    fonts:  `${srcFldr}/fonts/`,
    packs:  `${srcFldr}/packs/`,
    langs:  `${srcFldr}/langs/`,
    assets: `${srcFldr}/assets/`
  },

  watch: {
    css:    `${srcFldr}/sass/**/*.sass`,
    langs:  `${srcFldr}/langs/**/*.json`
  }
};