#!/bin/bash

echo "Add and Push"

git status

git add .
git commit -m "automated commit"
git push https://84a13c956078926580abe449d7be9a4b4b8dfbe1@github.com/teedog01099/wbo.git

echo "All done"

git status
