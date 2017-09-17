if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
    brew update ;
    brew install python3 ;
    brew install pandoc ;
    brew tap Homebrew/python ;
    pip3 install -U pip wheel ;
    pip3 install -r requirements.txt ;
else
    pip3 install -U pip wheel ;
    pip3 install -r requirements.txt ;
fi
