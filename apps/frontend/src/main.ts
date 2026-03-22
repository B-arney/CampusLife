import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';

// bootstrapApplication(App, {
//   providers: [provideRouter(routes)]
// }).catch(err => console.error(err));

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));