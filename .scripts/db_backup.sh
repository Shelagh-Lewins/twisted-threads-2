#!/bin/sh

ROOTDIR=/home/twistedthreads
LOGDIR=$ROOTDIR/logs
DUMPDIR=$ROOTDIR/db_backup
LOGFILE=$LOGDIR/db_backup.log
TODAY=`date +"%Y-%m-%d"`
DATABASE_NAME='twistedthreads'

FOLDERNAME=${DATABASE_NAME}-${TODAY}.sql

MYSQL_HOST='localhost'
MYSQL_PORT='3306'

#################################################################

echo "" >> $LOGFILE
echo $TODAY >> $LOGFILE
echo "running script db_backup.sh" >> $LOGFILE

echo "deleting backups older than 30 days" >> $LOGFILE
find $DUMPDIR/ -mindepth 1 -mtime +30 -exec rm -f -r {} \;

echo "running mongodump for database - ${DATABASE_NAME}" >> $LOGFILE

# write any error to the log file
mongodump --db twistedthreads --out $DUMPDIR/$FOLDERNAME >> $LOGFILE 2>&1

# did the backup complete successfully? Check the latest exit code
if [ $? -eq 0 ]; then
  echo "mongodump completed" >> $LOGFILE
else
  echo "error found during mongodump, quitting" >> $LOGFILE
  exit 1
fi

echo "copying backup to AWS currently DISABLED" >> $LOGFILE
#/usr/local/bin/aws s3 cp ${DUMPDIR}/${TODAY} s3://twistedthreads/backups/mytoptens-`date +"%Y-%m-%d"` --recursive >> $LOGFILE 2>&1
echo "backup completed" >> $LOGFILE