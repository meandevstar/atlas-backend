import 'dotenv/config';

import App from './app';
import AuthRoute from './routes/auth.route';
import UserRoute from './routes/user.route';
import TripRoute from './routes/trip.route';
import validateEnv from './utils/validateEnv';

validateEnv();

/**
 * Create server app
 */
const app = new App([
  new AuthRoute('/auth'),
  new UserRoute('/users'),
  new TripRoute('/trips'),
]);

/**
 * Start server app
 */
(async () => {
  await app.initializeDB();
  app.listen();
})();
