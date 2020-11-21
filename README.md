# An application that writes data to SmartStore collecting performance metrics

## Quick links
1. [Overview](#1-overview)
2. [Setup](#2-setup)
3. [Development](#3-development)
4. [Issues discovered](#4-issues-discovered)

## 1. Overview

![Screenshot](Screenshot.png)

### Settings screen
Through the settings screen one can control the shape of the records and whether to use external storage or not:
- External Storage
    - Serialize JSON over stream: Serialize JSON over an encrypted stream (this is the default)
    - Serialize JSON in memory: Serialize JSON to memory before writing to disk
- SmartStore DB Storage
    - Serialize using SFJsonUtils: Serialize JSON using SFJsonUtils before DB write (this is the default)
    - Serialize using NSJSONSerialization: Serialize JSON using NSJSONSerialization before DB write
- SQLite
    - Serialize using NSJSONSerialization: Write to SQLite without use SmartStore
- Key length: Length of keys in JSON object
- Payload start (K): Initial size of JSON payload
- Payload end (K): Final size of JSON payload
- Payload increment (K): Payload increment size

**Note:**
The settings screen will be simplified and additional information recorded based on the options.

Actions:
- Save: To update settings and go to console screen. If you change the storage type, the soup gets recreated
- Cancel: to go to console screen without updating settings

Bottom bar actions for selecting preset settings:
-
- Default: Go back to default settings

### Console screen:
Through the console screen, insert and run SmartStore tests.

Actions:
- Settings: Bring up Settings screen
- Clear Soup: Empty the soup
- +10: Insert 10 records based on Payload size in Settings
- RUN: Run a set of tests writing 10 records starting from 100K and ending at 2000K
- EXPORT: Exports performance in CSV form which can be accessed via the Files App
- ERASE: Erase performance data

Screen shows ouput for most recent operation first:
- Blue is for the beginning of an operation
- Green is for the end of an operation
- Red is for errors

## 2. Setup

### First time setup
After cloning this repo, you should do:
```shell
./install.sh
```
NB: you need forcehybrid installed.

Edit app/platforms/ios/Podfile and replace the contents with the Podfile contents
listed below. Then run the post install script.

```shell
./post-install.sh
```


### Running the application
To bring up the application in XCode do:
```shell
open ./app/platforms/ios/CorruptionTester.xcworkspace
```

Or open ./app/platforms/android in AndroidStudio.

## 3. Development

### Modifying the application locally
Edit files in `./app/platforms/ios/www/`.
If you have Safari web inspector connected (more info [here](https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/GettingStarted/GettingStarted.html)), you can simply do a `reload`. You don't need to relaunch the application.

### Modifying the application for github
Copy any files you changed from to `./app/platforms/ios/www/` to `./www`.

### Pointing to a different version of the Mobile SDK
Simply edit `./app/platforms/ios/Podfile` and change where to get the libraries from.
For instance, if you used forcehybrid 8.3, it would look something like:
```ruby
platform :ios, '13'
use_frameworks!
source 'https://cdn.cocoapods.org/'
target 'SmartStorePerf' do
	pod 'SalesforceHybridSDK', :git => 'https://github.com/smdesai/SalesforceMobileSDK-iOS-Hybrid', :branch => 'dev'
	pod 'Cordova', :git => 'https://github.com/forcedotcom/cordova-ios', :branch => 'cordova_6.1.1_sdk'
	pod 'MobileSync', :git => 'https://github.com/smdesai/SalesforceMobileSDK-iOS', :branch => 'dev'
	pod 'SmartStore', :git => 'https://github.com/smdesai/SalesforceMobileSDK-iOS', :branch => 'dev'
	pod 'FMDB/SQLCipher', :git => 'https://github.com/ccgus/fmdb', :tag => '2.7.5'
	pod 'SQLCipher/fts', :git => 'https://github.com/sqlcipher/sqlcipher', :tag => 'v4.4.0'
	pod 'SalesforceSDKCore', :git => 'https://github.com/smdesai/SalesforceMobileSDK-iOS', :branch => 'dev'
	pod 'SalesforceAnalytics', :git => 'https://github.com/smdesai/SalesforceMobileSDK-iOS', :branch => 'dev'
	pod 'SalesforceSDKCommon', :git => 'https://github.com/smdesai/SalesforceMobileSDK-iOS', :branch => 'dev'
end
```
