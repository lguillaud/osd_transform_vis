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

import { validateEditorValue } from '../public/editor_validation';

describe('editor syntax validation', () => {
  it('accepts empty and valid Multi Query DSL', () => {
    expect(validateEditorValue('multiquerydsl', '')).toEqual([]);
    expect(validateEditorValue('multiquerydsl', '{"query": "_DASHBOARD_CONTEXT_"}')).toEqual([]);
  });

  it('reports invalid JSON and clears the error after correction', () => {
    expect(validateEditorValue('multiquerydsl', '{\n  "query": }')).toEqual([
      expect.objectContaining({ type: 'error', text: expect.any(String) }),
    ]);
    expect(validateEditorValue('multiquerydsl', '{\n  "query": {}\n}')).toEqual([]);
  });

  it('reports JavaScript syntax errors at their location without executing the code', () => {
    expect(validateEditorValue('meta', '({\n  value: \n})')).toEqual([
      expect.objectContaining({ type: 'error', row: 2 }),
    ]);
    expect(
      validateEditorValue('meta', '({ value: () => { throw new Error("not run"); } })')
    ).toEqual([]);
  });

  it('does not validate Mustache templates as JavaScript or JSON', () => {
    expect(validateEditorValue('formula', '{{#items}}<div>{{name}}</div>{{/items}}')).toEqual([]);
  });
});
