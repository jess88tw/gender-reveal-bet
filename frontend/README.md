# Frontend

Angular 17 Standalone Components 前端，使用 signals 進行狀態管理。

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4444/`.

The application will automatically reload if you change any of the source files.

## Configuration

前端不需要額外設定個人化資訊（Google Client ID、Admin Emails 等）。

所有設定統一在 `backend/.env` 管理，前端啟動時會透過 `ConfigService` + `APP_INITIALIZER` 自動從 `GET /api/config` 載入。

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
