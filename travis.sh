#!/bin/bash

DIR=$(cd `dirname $0` && pwd)
TASK="build"

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -t|--task)
    TASK="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

echo TASK: "$TASK"

if [ "$TASK" = "build" ]; then
	cd ${DIR}
	
	npm install -g gulp-cli
	npm install

	gulp styles --themes Default,DeepForest,Funny,Sand --build a
	gulp js:build --build a
	gulp js:min --build a
	gulp test
	
	PRODUCT_VERSION=`cat VERSION`
	
	echo CREATE ZIP FILE: "${PRODUCT_NAME}_${PRODUCT_VERSION}.zip"
	
	zip -rq ${PRODUCT_NAME}_${PRODUCT_VERSION}.zip data/settings/config.json data/settings/modules modules static system vendor dev ".htaccess" dav.php index.php LICENSE VERSION README.md favicon.ico robots.txt package.json composer.json composer.lock modules.json gulpfile.js pre-config.json privmail.png -x **/*.bak *.git*
fi

if [ "$TASK" = "test" ]; then
  newman run ./tests/tests.postman_collection.json -e ./tests/tests.postman_environment.json --env-var "Email=${TEST_EMAIL}" --env-var "Password=${TEST_PASSWORD}" --insecure --bail
  echo Error: $?	
  if [ $? -eq 0 ]; then
    exit 1
  fi
fi

if [ "$TASK" = "upload-deb-package" ]; then
	cd ${DIR}
	
	FILENAME=`basename ./installers/linux/dist/*.deb`
		
	echo UPLOAD INSTALLER FILE: "${FILENAME}"
	
	curl -v --ftp-create-dirs --retry 6 -T ./installers/linux/dist/${FILENAME} -u ${FTP_USER}:${FTP_PASSWORD} ftp://afterlogic.com/
fi

if [ "$TASK" = "upload-rpm-package" ]; then
	cd ${DIR}
	
	FILENAME=`basename ./installers/linux/dist/*.rpm`
		
	echo UPLOAD INSTALLER FILE: "${FILENAME}"
	
	curl -v --ftp-create-dirs --retry 6 -T ./installers/linux/dist/${FILENAME} -u ${FTP_USER}:${FTP_PASSWORD} ftp://afterlogic.com/
fi
