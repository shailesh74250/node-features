import 'dotenv/config';
import './config/aws-environment';
import app from './app';
import { appDataSource } from './app-data-source';
import config from './config';

appDataSource
  .initialize()
  .then(startServer)
  .catch((error: any) => console.log(error));

async function startServer(): Promise<void> {
   return new Promise((resolve) => {
      app.listen(config.port, () => {
        console.log(`Server connected with DB`);
        console.log(`Server started on port ${config.port}`);
        resolve(undefined);
      });
   });
}
