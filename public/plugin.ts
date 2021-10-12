import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  IUiSettingsClient,
  HttpSetup,
} from 'opensearch-dashboards/public';
import { Plugin as ExpressionsPublicPlugin } from '../../../src/plugins/expressions/public';
import { VisualizationsSetup } from '../../../src/plugins/visualizations/public';
import { createTransformVisDefinition } from './transform_vis';
import { createTransformVisFn } from './transform_fn';
import {
  DataPublicPluginSetup,
  DataPublicPluginStart,
  IDataPluginServices,
  TimefilterContract,
} from '../../../src/plugins/data/public';
import { setNotifications, setData, setSavedObjects, setInjectedMetadata } from './services';
import { getTransformVisRenderer } from './transform_vis_renderer';

/** @internal */
export interface TransformPluginSetupDependencies {
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
  visualizations: VisualizationsSetup;
  data: DataPublicPluginSetup;
}
export interface TransformPluginStartDependencies {
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
  visualizations: VisualizationsSetup;
  data: DataPublicPluginStart;
  uiActions: IDataPluginServices;
}

export interface TransformVisDependencies extends Partial<CoreStart> {
  uiSettings: IUiSettingsClient;
  http: HttpSetup;
  timefilter: TimefilterContract;
}
/** @internal */
export class TransformPlugin implements Plugin<void, void> {
  initializerContext: PluginInitializerContext;

  constructor(initializerContext: PluginInitializerContext) {
    this.initializerContext = initializerContext;
  }

  public async setup(
    core: CoreSetup,
    { expressions, visualizations, data }: TransformPluginSetupDependencies
  ) {
    const dependencies: TransformVisDependencies = {
      uiSettings: core.uiSettings,
      http: core.http,
      timefilter: data.query.timefilter.timefilter,
    };
    const config = createTransformVisDefinition({ uiSettings: core.uiSettings, data });
    expressions.registerRenderer(getTransformVisRenderer(dependencies));
    visualizations.createBaseVisualization(config);
    expressions.registerFunction(() =>
      createTransformVisFn({ uiSettings: core.uiSettings, timeFilter: data.query.timefilter })
    );
  }

  public async start(
    core: CoreStart,
    { expressions, visualizations, data, uiActions }: TransformPluginStartDependencies
  ) {
    setNotifications(core.notifications);
    setSavedObjects(core.savedObjects);
    setData(data);
    setInjectedMetadata(core.injectedMetadata);
  }
}
