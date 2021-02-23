#!/bin/bash

# find where the script is running from
# required for cron jobs and mongo js
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# load environment variables
. $SCRIPTPATH/.env

# set URL for Puppeteer
URL=$PUPPETEER_URL

# set other variables
while getopts u:p: option
do
case "${option}"
in
u) TWT_USERNAME=${OPTARG};;
p) PASSWORD=${OPTARG};;

esac
done

if [ -z "${TWT_USERNAME}" ]
	then
		echo "Enter your username (case sensitive):"
		read TWT_USERNAME
fi

if [ -z "${PASSWORD}" ]
	then
		echo "Enter your password:"
		read -s PASSWORD
fi

export URL
export TWT_USERNAME
export PASSWORD

# set up logging

LOGDIR=~/logs
LOGFILE=$LOGDIR/findTwistValues.log



## run script to own all patterns
# pass in environment variables
MONGO_ADDRESS="${MONGO_HOST}"':'"${MONGO_PORT}"

ENVVARS='var mongoAddress='\'"${MONGO_ADDRESS}"\''; var databaseName='\'"${DATABASE_NAME}"\''; var username='\'"${TWT_USERNAME}"\'';'

# provide the pattern ids to javascript inside Puppeteer, which is all client side
# https://stackoverflow.com/questions/2559076/how-do-i-redirect-output-to-a-variable-in-shell/15170225
PATTERN_IDS=$(mongo --port $MONGO_PORT --quiet --eval "${ENVVARS}" $SCRIPTPATH/ownAllPatterns.js)

export PATTERN_IDS

# put all pattern ids in a file
#mongo --port $MONGO_PORT --quiet --eval 'DBQuery.shellBatchSize = 10000; conn = new Mongo(); db = conn.getDB("meteor"); db.patterns.find({}).toArray()' > patterns.json

## run script to visit each pattern
echo `date` >> $LOGFILE
echo Running bash script findTwistValues.sh >> $LOGFILE

node $SCRIPTPATH/findTwistValues.js >> $LOGFILE 2>&1

