#!/bin/bash

### save values of isTwistNeutral and willRepeat from patterns in the database
### to a text file

# find where the script is running from
# required for cron jobs and mongo js
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# load environment variables
. $SCRIPTPATH/.env

# set up logging

LOGDIR=~/logs
LOGFILE=$LOGDIR/exportTwistValues.log

## find the patterns that need to be viewed and make sure they are owned by the user
# pass in environment variables
MONGO_ADDRESS="${MONGO_HOST}"':'"${MONGO_PORT}"

ENVVARS='var mongoAddress='\'"${MONGO_ADDRESS}"\''; var databaseName='\'"${DATABASE_NAME}"\''; var username='\'"${TWT_USERNAME}"\'';'

# run mongo shell query to find the values
echo `date` >> $LOGFILE
echo Running bash script exportTwistValues.sh >> $LOGFILE

# https://stackoverflow.com/questions/2559076/how-do-i-redirect-output-to-a-variable-in-shell/15170225
mongo "${DATABASE_NAME}" --port "${MONGO_PORT}" --quiet --eval 'DBQuery.shellBatchSize = 10000; db.patterns.find({patternType: {$ne: "freehand"}}, {isTwistNeutral: 1, willRepeat: 1, patternType: 1 }).toArray()' > patterns.json
