import { mergeApplicationConfig, type ApplicationConfig } from '@angular/core';
import {
  provideServerRendering,
  withRoutes,
  RenderMode,
  type ServerRoute,
} from '@angular/ssr';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
