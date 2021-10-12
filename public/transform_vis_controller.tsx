import '@webcomponents/shadydom';
import React from 'react';
// @ts-ignore
import ShadowDOM from 'react-shadow';
// @ts-ignore
import { saveAs } from '@elastic/filesaver';
import OnMount from './on_mount';
import { Vis } from '../../../src/plugins/visualizations/public/vis';

import './index.scss';
import { TransformVisData } from './types';
import { DataPublicPluginSetup } from '../../../src/plugins/data/public';


interface TransformVisComponentProps extends TransformVisData {
  renderComplete: () => {};
  vis: Vis ;
  data: DataPublicPluginSetup;
}

/**
 * The TransformVisComponent renders transform to HTML and presents it.
 */
class TransformVisComponent extends React.Component<TransformVisComponentProps> {
  private transformVis = React.createRef<HTMLDivElement>();

  constructor(props: TransformVisComponentProps) {
    super(props);
    this.afterRender = this.afterRender.bind(this);
  }

  async afterRender() {
 
    if (
      
      this.props.meta &&
      typeof this.props.meta.after_render === 'function' &&
      this.transformVis.current &&
      this.transformVis.current.parentNode &&
      this.transformVis.current.parentNode instanceof ShadowRoot
    ) {
      const root: ShadowRoot = this.transformVis.current.parentNode;
      try {
        await this.props.meta.after_render.bind({
          el: root.host.parentNode,
          container: root.host,
          root,
          vis: {
            ...this.props,
            API: {
              ...this.props.vis,
              timeFilter: {
                //getBounds: this.props.data.query.timefilter.timefilter.getBounds.bind(this.props.timefilter),
                //getActiveBounds: this.props.data.query.timefilter.timefilter.getActiveBounds.bind(this.props.timefilter),
                //getTime: this.props.data.query.timefilter.timefilter.getTime.bind(this.props.timefilter),
              },
            },
            size: [root.host.clientWidth, root.host.clientHeight],
          },
          //es: this.props.es,
          context: this.props.context,
          timeRange: this.props.timeRange,
          //timefilter: this.props.data.query.timefilter.timefilter,
		  timefilter: this.props.timefilter,
          //filterManager: this.props.data.query.filterManager,
          meta: this.props.meta,
          saveAs,
        })();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error executing after_render for '${(this.props.vis || {}).title}':`, err);
      }
    }
    this.props.renderComplete();
  }

  /**
   * Render the actual HTML.
   */
  render() {
    return (
      <ShadowDOM>
        <div className="output-vis">
          <OnMount           
            ref={this.transformVis}            
            onMount={this.afterRender}
            onUpdate={this.afterRender}
            dangerouslySetInnerHTML={{ __html: this.props.transform }}
          />
        </div>
      </ShadowDOM>
    );
  }
}

export { TransformVisComponent as default };
