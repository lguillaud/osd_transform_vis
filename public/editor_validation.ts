/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import type { Annotation } from 'brace';
import { babelTransform } from './babel_transform';
import { TransformVisParamsNames } from './types';

function getErrorLocation(error: Error, value: string): { row: number; column: number } {
  if ('loc' in error && typeof error.loc === 'object' && error.loc !== null) {
    const loc = error.loc;
    if (
      'line' in loc &&
      typeof loc.line === 'number' &&
      'column' in loc &&
      typeof loc.column === 'number'
    ) {
      return { row: Math.max(0, loc.line - 1), column: loc.column };
    }
  }

  const lineColumn = error.message.match(/line (\d+) column (\d+)/i);
  if (lineColumn) {
    return { row: Math.max(0, Number(lineColumn[1]) - 1), column: Number(lineColumn[2]) - 1 };
  }

  const position = error.message.match(/position (\d+)/i);
  if (position) {
    const lines = value.slice(0, Number(position[1])).split('\n');
    return { row: lines.length - 1, column: lines[lines.length - 1].length };
  }

  return { row: 0, column: 0 };
}

export function validateEditorValue(param: TransformVisParamsNames, value: string): Annotation[] {
  if (param === 'formula') return [];

  try {
    if (param === 'multiquerydsl') {
      JSON.parse(value || '{}');
    } else {
      babelTransform(value);
    }
    return [];
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;

    return [{ ...getErrorLocation(error, value), text: error.message, type: 'error' }];
  }
}
