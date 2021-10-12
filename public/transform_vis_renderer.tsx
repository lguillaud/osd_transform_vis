import React, { lazy } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { ExpressionRenderDefinition } from 'src/plugins/expressions';
import { OpenSearchDashboardsContextProvider } from '../../../src/plugins/opensearch_dashboards_react/public';
import { VisualizationContainer } from '../../../src/plugins/visualizations/public';
import { TransformVisDependencies } from './plugin';
import { TransformRenderValue } from './types';


// @ts-ignore

const TransformVisComponent = lazy(() => import('./transform_vis_controller'));

export const getTransformVisRenderer: (
  deps: TransformVisDependencies
) => ExpressionRenderDefinition<TransformRenderValue> = (deps) => ({
  name: 'transform_vis',
  displayName: 'Transform visualization',
  reuseDomNode: true,
  render: (domNode, { visData, visParams }, handlers) => {
    handlers.onDestroy(() => {
      unmountComponentAtNode(domNode);
    });


    render(
      <VisualizationContainer handlers={handlers} >
        <OpenSearchDashboardsContextProvider services={{ ...deps }}>
               <TransformVisComponent {...visData} 
               renderComplete={handlers.done}
               vis={visData.vis}></TransformVisComponent>
        </OpenSearchDashboardsContextProvider>
      </VisualizationContainer>,
      domNode
    );
  },
});
