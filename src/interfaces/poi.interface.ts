interface ShardsResponse {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

interface Explanation {
  value: number;
  description: string;
  details: Explanation[];
}

interface Hit<T> {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: T;
  _version?: number;
  _explanation?: Explanation;
  fields?: any;
  highlight?: any;
  inner_hits?: any;
  matched_queries?: string[];
  sort?: string[];
}

export interface SearchResponse<T> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  _shards: ShardsResponse;
  hits: {
    total: number;
    max_score: number;
    hits: Hit<T>[];
  };
  aggregations?: any;
}

export interface Source {
  name: string;
  admin1_name: string;
  admin2_name: string;
  country_code: string;
  geonameid: number;
}
