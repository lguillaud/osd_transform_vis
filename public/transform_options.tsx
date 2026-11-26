import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ace from 'brace';
import type { Annotation } from 'brace';
// @ts-ignore EuiCodeEditor
import { EuiPanel, EuiCodeEditor, EuiFlexItem } from '@elastic/eui';
import 'brace/theme/textmate';
import 'brace/mode/json';
import 'brace/mode/javascript';
import 'brace/mode/handlebars';
import 'brace/snippets/json';
import 'brace/snippets/javascript';
import 'brace/snippets/handlebars';
import 'brace/snippets/text';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

import ReactResizeDetector from 'react-resize-detector';
import { VisOptionsProps } from 'src/plugins/vis_default_editor/public';
import { TransformVisParams, TransformVisParamsNames } from './types';
import { validateEditorValue } from './editor_validation';

const mode: Record<TransformVisParamsNames, string> = {
  multiquerydsl: 'json',
  meta: 'javascript',
  formula: 'handlebars',
};

function getTransformOptions(param: TransformVisParamsNames) {
  //return function TransformOptions({ stateParams, setValue }: BasicOptions<TransformVisParams>) {

  return function TransformOptions({
    stateParams,
    setValue,
  }: Pick<VisOptionsProps<TransformVisParams>, 'stateParams' | 'setValue'>) {
    const onChange = useCallback((value: any) => setValue(param, value), [setValue]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const value = stateParams[param];
    // A custom mode is applied after EuiCodeEditor disables workers.
    const editorMode = useMemo(() => new (ace.acequire(`ace/mode/${mode[param]}`).Mode)(), []);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setAnnotations(validateEditorValue(param, value));
      }, 300);
      return () => clearTimeout(timeout);
    }, [value]);

    const codeEditor = useRef<EuiCodeEditor>(null);
    const onResize = useCallback(() => {
      const current = codeEditor.current;
      if (current !== null && current.aceEditor !== null) {
        current.aceEditor.editor.resize();
      }
    }, [codeEditor]);

    return (
      <EuiPanel paddingSize="s" grow={true}>
        <EuiCodeEditor
          ref={codeEditor}
          key={param}
          mode={editorMode}
          theme="textmate"
          className="visEditor--transform__textarea"
          value={stateParams[param]}
          onChange={onChange}
          annotations={annotations}
          data-test-subj="transformCodeeditor"
          width="100%"
          height="100%"
          setOptions={{
            useWorker: false,
            useSoftTabs: true,
            tabSize: 2,
            fontSize: '14px',
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
          }}
          minLines={6}
        />
        <ReactResizeDetector handleWidth handleHeight onResize={onResize} />
      </EuiPanel>
    );
  };
}

export { getTransformOptions };
