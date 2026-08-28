import 'react-native-gesture-handler';
import {I18nManager} from 'react-native';
/* Direction is handled by the app itself (settings → Hebrew RTL / English LTR,
   switchable at runtime without a restart), so RN's automatic mirroring must
   stay off in both languages. */
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

import {registerRootComponent} from 'expo';
import App from './App';

registerRootComponent(App);
