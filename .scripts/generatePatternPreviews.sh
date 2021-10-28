#!/bin/bash

### Find the ids of all patterns that do not have a patternPreview
### View them with Google Puppeteer to generate and save a preview
### WARNING!!! This will set createdBy to the user provided in the command line
### NEVER run this script on live data

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
LOGFILE=$LOGDIR/generatePatternPreviews.log

## find the patterns that need to be viewed and make sure they are owned by the user
# pass in environment variables
MONGO_ADDRESS="${MONGO_HOST}"':'"${MONGO_PORT}"

ENVVARS='var mongoAddress='\'"${MONGO_ADDRESS}"\''; var databaseName='\'"${DATABASE_NAME}"\''; var username='\'"${TWT_USERNAME}"\'';'

# run script to find the pattern ids to view
PATTERN_IDS=$(mongo --port $MONGO_PORT --quiet --eval "${ENVVARS}" $SCRIPTPATH/getPatternsWithoutPreview.js)

IFS=',' read -ra IDS_ARRAY <<< "$PATTERN_IDS"
echo IDS_ARRAY $IDS_ARRAY

LENGTH=${#IDS_ARRAY[@]}
echo "number of patterns" $LENGTH

## run script to visit each pattern
echo `date` >> $LOGFILE
echo Running bash script generatePatternPreviews.sh >> $LOGFILE

for i in "${!IDS_ARRAY[@]}"
do
   echo processing pattern number "$i" / $LENGTH
   echo "${IDS_ARRAY[$i]}"
   PATTERN_ID=${IDS_ARRAY[$i]}
   export PATTERN_ID
   node $SCRIPTPATH/viewPatterns.js >> $LOGFILE 2>&1
done

