#!/bin/bash
rm -r ./dist 

yarn build 

cp ./src/data/attribute-number-list.json ./dist/attribute-number-list.json
cp ./src/data/attribute-percentage-list.json ./dist/attribute-percentage-list.json
cp ./src/data/rank.txt ./dist/rank.txt

aws s3 rm s3://apeprojectinfo.xyz --recursive

aws s3 sync ./dist s3://apeprojectinfo.xyz

aws cloudfront create-invalidation \
    --distribution-id E1JWUD3X7H3W2T \
    --paths "/*"