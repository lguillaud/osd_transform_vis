/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { get } from 'lodash';
import { i18n } from '@osd/i18n';
import { IUiSettingsClient } from 'opensearch-dashboards/public';

import {  TransformExpressionFunctionDefinition } from './types';
import { getTransformRequestHandler } from './request_handler';
import { Query} from '../../../src/plugins/data/public';
import { TimefilterSetup } from 'src/plugins/data/public/query';




export const createTransformVisFn = ({
  uiSettings,
  timeFilter
}: {
  uiSettings: IUiSettingsClient;
  timeFilter:TimefilterSetup
}): TransformExpressionFunctionDefinition => ({
  name: 'transform_vis',
  type: 'render',
  inputTypes: ['opensearch_dashboards_context', 'null'],
  help: i18n.translate('visTypeTransform.function.help', {
    defaultMessage: 'Transform visualization',
  }),
  args: {
    multiquerydsl: {
      types: ['string'],
      required: true,
      help: i18n.translate('visTypeTransform.function.multiquerydsl.help', {
        defaultMessage: 'Requests to query ES data',
      }),
    },
    meta: {
      types: ['string'],
      required: true,
      help: i18n.translate('visTypeTransform.function.meta.help', {
        defaultMessage: 'Javascript functions to transform requested data',
      }),
    },
    formula: {
      types: ['string'],
      required: true,
      help: i18n.translate('visTypeTransform.function.formula.help', {
        defaultMessage: 'Mustache template to render visualisation',
      }),
    },
  },
  async fn(input, args) {
    const transformRequestHandler = getTransformRequestHandler({ uiSettings, timeFilter });
    const visParams = {
      multiquerydsl: args.multiquerydsl,
      meta: args.meta,
      formula: args.formula,
    };
    const response = await transformRequestHandler({
      timeRange: get(input, 'timeRange', null),
      query: <Query | null> get(input, 'query', null),
      filters: get(input, 'filters', null),
      visParams: args,
    });

    return {
      type: 'render',
      as: 'transform_vis',
      value: {
        visType: 'transform',
        visParams,
        visData: response,
      },
    };
  },
});
