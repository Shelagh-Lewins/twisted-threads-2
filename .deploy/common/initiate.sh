#!/bin/bash
set -e

# use to reference other scripts in the same directory as this one
my_dir=`dirname $0`

# Load environment variables from argument
if [ -z "$1" ]; then
  echo "Usage: $0 path/to/.env"
  exit 1
fi
. "$1"

### Configuration ###
APP_DIR=/var/www/twistedthreads
KEYFILE=
REMOTE_SCRIPT_PATH=/tmp/deploy-twistedthreads.sh
WORK_SCRIPT_PATH="$my_dir/work.sh"

### Library ###

function run()
{
  echo "Running: $@"
  "$@"
}

### Automation steps ###

if [[ "$KEYFILE" != "" ]]; then
  KEYARG="-i $KEYFILE"
else
  KEYARG=
fi

run meteor build --server-only ../output
mv ../output/*.tar.gz ./package.tar.gz

run scp $KEYARG package.tar.gz $SERVER:$APP_DIR/
run scp $KEYARG $WORK_SCRIPT_PATH $SERVER:$REMOTE_SCRIPT_PATH
echo
echo "---- Running deployment script on remote server ----"
run ssh $KEYARG $SERVER bash $REMOTE_SCRIPT_PATH
