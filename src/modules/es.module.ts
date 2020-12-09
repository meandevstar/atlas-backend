import { Client } from '@elastic/elasticsearch';
import { SearchResponse, Source } from 'interfaces/poi.interface';
import Config from '../config';

class ESModule {

  private client = new Client({
    cloud: {
      id: Config.esCloudId,
    },
    auth: {
      username: Config.esUsername,
      password: Config.esPassword,
    },
  });
  public search: (params: any) => { body: SearchResponse<Source> };

  constructor() {
    this.search = this.client.search.bind(this.client);
  }

}

export default ESModule;