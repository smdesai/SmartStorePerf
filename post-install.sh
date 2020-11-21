#!/bin/sh

# Update the plugin
cp post-install/*.js app/platforms/ios/www/plugins/com.salesforce/www/

# Alter the .plist to allow files to be accessible via the Files.app
patch app/platforms/ios/SmartStorePerf/SmartStorePerf-Info.plist post-install/patch.txt
