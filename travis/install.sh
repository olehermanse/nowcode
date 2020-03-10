#!/usr/bin/env bash
if [[ $TRAVIS_OS_NAME == 'osx' ]];
then
    # brew install things
else
    sudo apt-get update ;
    sudo apt-get install nodejs ;
    sudo apt-get install npm ;
fi

npm install --global gulp-cli

cd frontend || exit 1 ;

npm install --save-dev
