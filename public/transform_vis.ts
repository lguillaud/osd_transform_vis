import { i18n } from '@osd/i18n';

import { IUiSettingsClient } from 'opensearch-dashboards/public';
import { DefaultEditorSize } from '../../../src/plugins/vis_default_editor/public';

import { getTransformOptions } from './transform_options';
import { getTransformRequestHandler } from './request_handler';
import { toExpressionAst } from './to_ast';
import { DataPublicPluginSetup } from '../../../src/plugins/data/public';

export const createTransformVisDefinition = ({
  uiSettings,
  data,
}: {
  uiSettings: IUiSettingsClient;
  data: DataPublicPluginSetup;
}) => {
  const transformRequestHandler = getTransformRequestHandler({
    uiSettings,
    timeFilter: data.query.timefilter,
  });

  return {
    name: 'transform',
    title: 'Transform',
    icon: 'editorCodeBlock',
    description: i18n.translate('visTypeTransform.transformDescription', {
      defaultMessage: 'Transfom query results to custom HTML using template language',
    }),
    toExpressionAst,
    visConfig: {
      defaults: {
        meta: `({
  count_hits: function() {
    return this.response.logstash_query.hits.total.value;
  }
})`,
        multiquerydsl: `{
  "logstash_query": {
    "index": "logstash-*",
    "query": {
      "bool": {
        "must": [
          "_DASHBOARD_CONTEXT_",
          "_TIME_RANGE_[@timestamp]"
        ]
      }
    }
  }
}`,
        formula: '<hr>{{response.logstash_query.hits.total.value}} total hits<hr>',
      },
    },
    editorConfig: {
      optionTabs: [
        {
          name: 'dsl',
          title: 'Multi Query DSL',
          editor: getTransformOptions('multiquerydsl'),
        },
        {
          name: 'js',
          title: 'Javascript',
          editor: getTransformOptions('meta'),
        },
        {
          name: 'template',
          title: 'Template',
          editor: getTransformOptions('formula'),
        },
      ],
      enableAutoApply: false,
      defaultSize: DefaultEditorSize.LARGE,
    },
    requestHandler: transformRequestHandler,
    responseHandler: 'none',
    options: {
      showIndexSelection: false,
      showQueryBar: true,
      showFilterBar: true,
    },
  };
};
