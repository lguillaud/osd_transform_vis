import {
  CoreStart,
  SavedObjectsStart,
  NotificationsStart,
  IUiSettingsClient,
} from 'src/core/public';

import { DataPublicPluginStart } from '../../../src/plugins/data/public';
import { createGetterSetter } from '../../../src/plugins/opensearch_dashboards_utils/public';

export const [getData, setData] = createGetterSetter<DataPublicPluginStart>('dataStart');

export const [getNotifications, setNotifications] = createGetterSetter<NotificationsStart>(
  'Notifications'
);
export const [
  getOpenSearchDashboardsMapFactory,
  setOpenSearchDashboardsMapFactory,
] = createGetterSetter<any>('OpenSearchDashboardsMapFactory');

export const [getUISettings, setUISettings] = createGetterSetter<IUiSettingsClient>('UISettings');

export const [getInjectedMetadata, setInjectedMetadata] = createGetterSetter<
  CoreStart['injectedMetadata']
>('InjectedMetadata');

export const [getSavedObjects, setSavedObjects] = createGetterSetter<SavedObjectsStart>(
  'SavedObjects'
);

export const [getInjectedVars, setInjectedVars] = createGetterSetter<{
  esShardTimeout: number;
  enableExternalUrls: boolean;
  emsTileLayerId: unknown;
}>('InjectedVars');

export const getEnableExternalUrls = () => getInjectedVars().enableExternalUrls;
