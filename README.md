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

The API base URL used to fetch the data files is set using `.env` files (`.env.development` for development and `.env.production` for production).

In the respective `.env` file, wet the `VUE_APP_API_BASEURL` variable to the root URL for fetching data files. This variable is used to set the `baseURL` option in `axios`.

```sh
# Option 1: Use local server, which exposes the ./data folder at port 8083 (must be started using `yarn/npm run data`, see below)
VUE_APP_API_BASEURL="http://localhost:8083/"

# Option 2: Fetch files from AWS S3
VUE_APP_API_BASEURL="http://ecosheds.org.s3.us-east-1.amazonaws.com/tame-dev"
```

NOTE: the `.env` files are tracked by the repo. Override them using `.env.development.local`, which will not be tracked.

### Public Path

For the production version, set the root public path in `vue.config.js`. For development mode, leave as `/`.

```js
{
  publicPath: process.env.NODE_ENV === 'production' ? '/dev/tame/' : '/'
}
```

## Run Development Server

To run the development server with HOT-reloading. The client will fetch the data whichever URL is set to `VUE_APP_API_BASEURL` in `.env.development`.

```sh
yarn serve
# or
npm run serve
```

To serve files from local machine, edit `.env.development` and set `VUE_APP_API_BASEURL="http://localhost:8083/"`. Then run the `data` command which runs `http-server` on the `./data` folder:

```sh
yarn data
# or
npm run data
```

## Build and Deploy to Production

To build the production version, run the `build` command. The client will fetch the data whichever URL is set to `VUE_APP_API_BASEURL` in `.env.production`.

```sh
yarn build
# or
npm run build
```

To deploy to the server run (note: this will also run `build` command first). Requires ssh access to `jeff@ecosheds.org`

```sh
yarn deploy
# or
npm run deploy
```
