# Simple application that tries to corrupt SmartStore

## What does the app do?

Buttons:
- clear: to empty the soup
- + 10, + 100: to insert 10 or 100 large records. The size of records inserted (and the time it took are reported)
- Q 1 by 1, Q 10 by 10: to query all records from the soup with a page size of 1 and 10 respectively. The number of records founds / expected (and the time it took) are reported

Screen shows ouput for most recent operation first.
- Blue is for the beginning of a add/query operation
- Green is for the end of a add/query operation
- Red is for window.onerror messages

The shape of the records is controlled from the code (see `app.js`):
```javascript
// Shape of entries
const DEPTH = 2 // depth of json objects
const NUMBER_OF_CHILDREN = 3 // number of branches at each level
const KEY_LENGTH = 32 // length of keys
const VALUE_LENGTH = 65536 // length of leaf values
const MIN_CHARACTER_CODE = 32 // smallest character code to use in random strings
const MAX_CHARACTER_CODE = 65536 // largest character code to use in random strings
```

## First time setup
After cloning this repo, you should do:
```shell
./install.sh
```
NB: you need forcehybrid installed.

## Running the application
To bring up the application in XCode do:
```shell
open ./app/platforms/ios/CorruptionTester.xcworkspace
```

## Modifying the application locally
Edit files in `./app/platforms/ios/www/`.
If you have Safari web inspector connected (more info [here](https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/GettingStarted/GettingStarted.html)), you can simply do a `reload`. You don't need to relaunch the application.

## Modifying the application for github
Copy any files you changed from to `./app/platforms/ios/www/` to `./www`.

