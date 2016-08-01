#Cheers

Where Everyone Knows Your Name

## How to install?
Make sure the following are installed in your machine:

- [NPM](http://npmjs.org/) via [NodeJS](https://nodejs.org)
- [Ionic CLI](http://ionicframework.com/docs/v2) and [Gulp JS](http://gulpjs.com/)
- [CouchDB](http://couchdb.apache.org/)
- Cheers API

Everything installed? Perform the following:
- Open your favorite terminal
- Clone the repository
- Once it is finished cloning,  type `cd {project-directory}` then type `npm install`
- Once you've seen the `node_modules` folder in your project directory, you're now good to go.

## How to run?
You can either of the following:
- Run `ionic serve` in the project directory and check [http://localhost:8100](http://localhost:8100) if the application start. (WARNING: This would not run because the BLE Library needs `cordova.js`, so it's better to turn off or remove the BLE initialization in the `app.ts` file.)
- Running it on your device! As of now, it officially supports Android Lollipop, Android Marshmallow, and iOS 8 and above.

### Running the app on Android

To run it on Android, make sure that Android SDK and Android Debug Brigde are installed. To start, make sure that USB debugging is enabled in your device.

- Get the device ID by typing in `adb devices` in your terminal
- Once you've got the device ID type `phonegap run android --verbose --debug --target=device_id` replace `device_id` with the real device ID.
- This will take some time so patience is a virtue!
