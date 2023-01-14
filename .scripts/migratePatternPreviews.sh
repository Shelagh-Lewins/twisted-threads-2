#!/bin/bash

### Find the ids of all patterns that have patternPreview stored in the database as URI
### View them with Google Puppeteer to generate and save a preview
### This should be run with the serviceuser who can view all patterns and save pattern previews.
### You will be prompted for username and password

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
LOGFILE=$LOGDIR/migratePatternPreviews.log

echo `date` >> $LOGFILE
echo Running bash script generatePatternPreviews.sh >> $LOGFILE

## find the patterns that need to be viewed
# pass in environment variables
MONGO_ADDRESS="${MONGO_HOST}"':'"${MONGO_PORT}"

ENVVARS='var mongoAddress='\'"${MONGO_ADDRESS}"\''; var databaseName='\'"${DATABASE_NAME}"\''; var username='\'"${TWT_USERNAME}"\'';'
echo 'about to check mongodb' $PATTERN_IDS
# run script to find the pattern ids to view
PATTERN_IDS=$(mongo --port $MONGO_PORT --quiet --eval "${ENVVARS}" $SCRIPTPATH/getPatternsWithoutAWSPreview.js)

echo "pattern IDs" $PATTERN_IDS

IFS=',' read -ra IDS_ARRAY <<< "$PATTERN_IDS"
echo IDS_ARRAY $IDS_ARRAY
# IDS_ARRAY is coded as comma separated string
# e.g. // e.g. 'A4,B2,C8:3'

#IN="bla@some.com;john@home.com"
#SPLIT_DATA=(${IDS_ARRAY//:/ })
#echo ${SPLIT_DATA[1]} 

## run script to visit each pattern


LENGTH=${#IDS_ARRAY[@]}
echo "number of patterns without AWS preview" $LENGTH

export PATTERN_IDS
node $SCRIPTPATH/viewPatterns.js >> $LOGFILE 2>&1

#for i in "${!IDS_ARRAY[@]}"
#do
#   echo processing pattern number "$i" / $LENGTH
#   echo "${IDS_ARRAY[$i]}"
#   PATTERN_ID=${IDS_ARRAY[$i]}
#   export PATTERN_ID
#   node $SCRIPTPATH/viewPatterns.js >> $LOGFILE 2>&1
#done

