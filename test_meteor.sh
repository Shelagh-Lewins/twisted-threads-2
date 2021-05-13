#!/usr/bin/env bash
. .env-test

TEST_WATCH=1 meteor test --driver-package meteortesting:mocha