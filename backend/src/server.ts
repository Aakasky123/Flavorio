import { env } from './config/env.js';
import { app, server } from './app.js';

server.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
