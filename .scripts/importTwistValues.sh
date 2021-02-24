#!/bin/bash

### Run this on live data to load isTwistNeutral and willRepeat from a json file
### and save it to patterns in the database

# find where the script is running from
# required for cron jobs and mongo js
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# load environment variables
. $SCRIPTPATH/.env

# set up logging
LOGDIR=~/logs
LOGFILE=$LOGDIR/importTwistValues.log

# pass in environment variables
MONGO_ADDRESS="${MONGO_HOST}"':'"${MONGO_PORT}"

ENVVARS='var mongoAddress='\'"${MONGO_ADDRESS}"\''; var databaseName='\'"${DATABASE_NAME}"\'';'

# run script to load data into the database
mongo --port $MONGO_PORT --eval "${ENVVARS}" $SCRIPTPATH/importTwistValues.js >> $LOGFILE 2>&1


