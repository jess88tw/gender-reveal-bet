import { APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ConfigService } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.load(),
      deps: [ConfigService],
      multi: true,
    },
  ],
};
