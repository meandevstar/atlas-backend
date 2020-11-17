import 'dotenv/config';

import App from './app';
import AuthRoute from './routes/auth.route';
import validateEnv from './utils/validateEnv';

validateEnv();

/**
 * Create server app
 */
const app = new App([
  new AuthRoute(),
]);

/**
 * Start server app
 */
(async () => {
  await app.initializeDB();
  app.listen();
})();
