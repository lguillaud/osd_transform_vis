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

import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import * as ace from 'brace';
import { getTransformOptions } from '../public/transform_options';

jest.mock('react-resize-detector', () => () => null);

describe('Transform editor', () => {
  it('bundles snippets for the initial text mode', () => {
    expect(ace.acequire('ace/snippets/text')).toEqual(expect.objectContaining({ scope: 'text' }));
  });

  it.each([
    ['multiquerydsl', '{', '{}'],
    ['meta', '({ value: })', '({ value: 1 })'],
  ] as const)('validates %s without starting an Ace worker', async (param, invalid, valid) => {
    const createObjectURL = jest.fn(() => 'worker-url');
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = createObjectURL;
    try {
      const Options = getTransformOptions(param);
      const props = {
        stateParams: { multiquerydsl: '{}', meta: '({})', formula: '', [param]: invalid },
        setValue: jest.fn(),
      };
      const { container, rerender } = render(<Options {...props} />);
      const element = container.querySelector<HTMLElement>('.ace_editor');
      if (!element) throw new Error('Ace editor was not mounted');
      const session = ace.edit(element).getSession();

      await waitFor(() => {
        expect(session.getAnnotations()).toEqual([expect.objectContaining({ type: 'error' })]);
      });
      expect(createObjectURL).not.toHaveBeenCalled();

      act(() => {
        rerender(<Options {...props} stateParams={{ ...props.stateParams, [param]: valid }} />);
      });
      await waitFor(() => {
        expect(session.getAnnotations()).toEqual([]);
      });
      expect(createObjectURL).not.toHaveBeenCalled();
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
    }
  });
});
