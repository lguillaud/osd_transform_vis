import { PluginInitializerContext } from '../../../src/core/server';
import { TransformPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new TransformPlugin(initializerContext);
}

export { TransformPluginSetup, TransformPluginStart } from './types';
