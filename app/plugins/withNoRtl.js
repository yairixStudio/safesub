/* Direction is handled by the app itself (Hebrew RTL / English LTR, switchable
   at runtime), so Android must not mirror native views by locale. */
const {withAndroidManifest} = require('expo/config-plugins');
module.exports = function withNoRtl(config){
  return withAndroidManifest(config, cfg => {
    const app = cfg.modResults.manifest.application?.[0];
    if(app) app.$['android:supportsRtl'] = 'false';
    return cfg;
  });
};
