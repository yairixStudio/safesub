/* 1. supportsRtl=false — the app owns direction (Hebrew RTL / English LTR at runtime).
   2. allowBackup=false — the journal must never ride Android's cloud backup;
      "everything stays on the device" is a product promise, not a default. */
const {withAndroidManifest} = require('expo/config-plugins');
module.exports = function withAndroidTweaks(config){
  return withAndroidManifest(config, cfg => {
    const app = cfg.modResults.manifest.application?.[0];
    if(app){
      app.$['android:supportsRtl'] = 'false';
      app.$['android:allowBackup'] = 'false';
      delete app.$['android:fullBackupContent'];
      delete app.$['android:dataExtractionRules'];
    }
    return cfg;
  });
};
