import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as logger from 'morgan';
import * as mongoose from 'mongoose';
import Config from './config';
import Routes from './interfaces/routes.interface';

class App {
  public app: express.Application;
  public port: (string | number);
  public env: boolean;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = Config.port;
    this.env = Config.NODE_ENV === 'production' ? true : false;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`✅️ App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  /**
   * Setup all middlewares for app
   */
  private initializeMiddlewares() {
    if (this.env) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(logger('combined'));
      // TODO: need to handle in future
      this.app.use(cors({ origin: true, credentials: true }));
    } else {
      this.app.use(logger('dev'));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  /**
   * Setup route for app
   * @param routes
   */
  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use(route.path, route.router);
    });
  }

  /**
   * Create connection to MongoDB
   */
  public async initializeDB() {
    try {
      const connection = await mongoose.connect(Config.databaseUrl, {
        useNewUrlParser    : true,
        useUnifiedTopology : true,
      });
      console.info('✅️ DB successfully connected!');
      return connection.connection.db;

    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default App;
