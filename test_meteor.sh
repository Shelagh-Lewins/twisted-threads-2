#!/usr/bin/env bash
. .env-test

# Usage: 
#   ./test_meteor.sh                           # Run all tests
#   ./test_meteor.sh "server/test/02a*"        # Run specific test file(s)

# Usage: 
#   ./test_meteor.sh                    # Run all tests
#   ./test_meteor.sh "pattern.edit"     # Run tests matching name / text inside describe block

if [ -n "$1" ]; then
  # Run tests matching grep pattern
  TEST_WATCH=1 MOCHA_GREP="$1" meteor test --driver-package meteortesting:mocha
else
  # Run all tests
  TEST_WATCH=1 meteor test --driver-package meteortesting:mocha
fi