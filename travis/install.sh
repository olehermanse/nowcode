#!/usr/bin/env bash
if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
    brew update ;
    brew install python3 ;
    brew tap Homebrew/python ;
else
    sudo apt-get update ;
    sudo apt-get install nodejs ;
    sudo apt-get install npm ;
fi

pip3 install -U pip wheel ;
pip3 install -r requirements.txt ;

npm install -g spectacle-docs
npm install --global gulp-cli

cd web || exit 1 ;

npm install --save-dev
