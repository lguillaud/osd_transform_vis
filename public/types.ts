import { Filter } from 'src/plugins/data/common/opensearch_query/filters';
import { DslQuery } from 'src/plugins/data/common/opensearch_query/opensearch_query/opensearch_query_dsl';
import { OpenSearchDashboardsContext, TimeRange } from 'src/plugins/data/public/search/expressions';
import { Timefilter } from 'src/plugins/data/public/query/timefilter';
import { ExpressionFunctionDefinition, Render } from 'src/plugins/expressions/public';


type Input = OpensearchDashboardsContext | null;
type Output = Promise<Render<TransformRenderValue>>;
export interface TransformRenderValue {
  visData: any;
  visType: 'transform';
  visParams: TransformVisParams;
}
export interface Arguments {
  multiquerydsl: string;
  meta: string;
  formula: string;
}
export type TransformExpressionFunctionDefinition = ExpressionFunctionDefinition<
  'transform_vis',
  Input,
  TransformVisParams,
  Output
>;
export type TransformVisParamsNames = 'multiquerydsl' | 'meta' | 'formula';

export interface TransformVisParams {
  multiquerydsl: Arguments['multiquerydsl'];
  meta: Arguments['meta'];
  formula: Arguments['formula'];
}

export interface TransformVisData {
  transform: string;
  meta?: Record<string, any>;
  context?: {
    bool: {
      must: DslQuery[];
      filter: Filter[];
      should: never[];
      must_not: Filter[];
    };
  };
  timefilter?: Timefilter;
  timeRange?: TimeRange | null;
  buildEsQuery?: Function;
}
