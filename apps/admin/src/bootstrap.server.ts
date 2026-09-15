import {
  BootstrapContext,
  bootstrapApplication,
} from '@angular/platform-browser';
import { RemoteEntry } from './app/remote-entry/entry';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(RemoteEntry, config, context);

export default bootstrap;
