# SHEDS: Tagged Animal Movement Explorer (TAME)

Jeffrey D Walker, PhD (@walkerjeffd)  
[Walker Environmental Research, LLC](https://walkerenvres.com)

Benjamin Letcher, PhD (@bletcher)  
USGS Conte Anadromous Fish Lab and UMass Amherst

## Project setup

Install dependencies

```sh
yarn install
# or
npm install
```

## Configuration

### Data API

Data files are stored in the directory `public/data/`.

Set environmental variable `VUE_APP_API_BASEURL` to this path in the `.env` file:

```sh
VUE_APP_API_BASEURL="data/"
```

The data URL can be defined for separate modes (development vs production) using mode-specific `.env` files (e.g. `.env.development` and `.env.production`).

### Public Path

For the production version, set the root public path in `vue.config.js`. For development mode, leave as `/`.

```js
{
  publicPath: process.env.NODE_ENV === 'production' ? '/dev/tame/' : '/'
}
```

## Run Development Server

To run the development server with HOT-reloading. The client will fetch the data whichever URL is set to `VUE_APP_API_BASEURL` in `.env`.

```sh
yarn serve
# or
npm run serve
```

## Build and Deploy to Production

To build the production version, run the `build` command.

```sh
yarn build
# or
npm run build
```

To deploy to the server run (note: this will also run `build` command first). Requires ssh access to `jeff@ecosheds.org`.

```sh
yarn deploy
# or
npm run deploy
```
