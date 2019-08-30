#!/bin/bash

if [ -d "./app" ]; then
    echo "Hybrid app for iOS already exists"
else
    echo "Generating hybrid app for iOS"
    forcehybrid create --platform=ios --apptype=hybrid_local --appname=CorruptionTester --packagename=com.salesforce.corruptiontester --organization=Salesforce --outputdir=app
fi

echo "Copying www sources from ./www to ./app/platforms/ios/www/"
cp -r ./www/* ./app/platforms/ios/www/
