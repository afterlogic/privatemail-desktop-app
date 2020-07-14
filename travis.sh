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
	
	curl --ftp-create-dirs --ftp-pasv --retry 6 -T ./installers/linux/dist/${FILENAME} -u ${FTP_USER}:${FTP_PASSWORD} ftp://afterlogic.com/
fi

if [ "$TASK" = "upload-rpm-package" ]; then
	cd ${DIR}
	
	FILENAME=`basename ./installers/linux/dist/*.rpm`
	
	echo UPLOAD INSTALLER FILE: "${FILENAME}"
	
	curl --ftp-create-dirs --ftp-pasv --retry 6 -T ./installers/linux/dist/${FILENAME} -u ${FTP_USER}:${FTP_PASSWORD} ftp://afterlogic.com/
fi
