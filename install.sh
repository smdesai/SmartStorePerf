#!/bin/bash

if [ -d "./app" ]; then
    echo "Hybrid app already exists"
else
    echo "Generating hybrid app for iOS and Android"
    forcehybrid create --platform=ios,android --apptype=hybrid_local --appname=CorruptionTester --packagename=com.salesforce.corruptiontester --organization=Salesforce --outputdir=app
fi

echo "Generating list of valid unicode code points"
curl http://www.unicode.org/Public/12.1.0/ucd/UnicodeData.txt > unicodeData.txt
echo "var VALID_CODEPOINTS = [" > ./www/validCodePoints.js
awk -F";" '
(index($2, "Private") == 0 && index($2, "Surrogate") == 0) {
   if (index($2, "First>") > 0)
      printf "[0x"$1","
   else if (index($2, "Last>") > 0)
      printf "0x"$1"],"
   else
      printf "0x"$1","
}' unicodeData.txt >> ./www/validCodePoints.js
echo "]" >> ./www/validCodePoints.js
rm unicodeData.txt

echo "Copying www sources from ./www to ./app/platforms/ios/www/"
cp -r ./www/* ./app/platforms/ios/www/

echo "Copying www sources from ./www to ./app/platforms/android/app/src/main/assets/www/"
cp -r ./www/* ./app/platforms/android/app/src/main/assets/www/
