// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyCTXjqlmwytQdC8TMKGTj1RttSm9f0xBTY",
    authDomain: "skycast-pa.firebaseapp.com",
    databaseURL: "https://skycast-pa.firebaseio.com",
    projectId: "skycast-pa",
    storageBucket: "skycast-pa.appspot.com",
    messagingSenderId: "258019674077"
  }
};
