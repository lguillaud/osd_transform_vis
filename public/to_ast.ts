/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { buildExpression, buildExpressionFunction } from '../../../src/plugins/expressions/common';
import { Vis } from '../../../src/plugins/visualizations/public/vis';
import { TransformExpressionFunctionDefinition, TransformVisParams } from './types';

export const toExpressionAst = (vis: Vis<TransformVisParams>) => {
  const { multiquerydsl, meta, formula } = vis.params;

  const transform = buildExpressionFunction<TransformExpressionFunctionDefinition>(
    'transform_vis',
    {
      multiquerydsl,
      meta,
      formula,
    }
  );

  const ast = buildExpression([transform]);

  return ast.toAst();
};
