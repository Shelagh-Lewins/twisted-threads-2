#!/bin/bash
# One-time data migration to:

# add includeInTwist field to patterns

# find where the script is running from
# required for cron jobs and mongo js
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# load environment variables
. $SCRIPTPATH/.env

# set up logging
LOGDIR=~/logs
LOGFILE=$LOGDIR/dataMigration2021_Feb.log

echo `date` >> $LOGFILE
echo Running bash script dataMigration2021_Feb.sh >> $LOGFILE

# pass in environment variables
MONGO_ADDRESS="${MONGO_HOST}"':'"${MONGO_PORT}"

ENVVARS='var mongoAddress='\'"${MONGO_ADDRESS}"\''; var databaseName='\'"${DATABASE_NAME}"\'';'

mongo --port $MONGO_PORT --eval "${ENVVARS}" $SCRIPTPATH/dataMigration2021_Feb.js >> $LOGFILE 2>&1
