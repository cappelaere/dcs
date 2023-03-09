# DCS_data Lambda Function

It is called when DCS messages are archived in XML archive file.
These messages are indexed into ElasticSearch and streamed using Kafka

## Installation Notes
make zip
make aws
and install manually as lambda function with layer

### Environment Variables
#### Topics:
DCS_GOES_ARN
DCS_IRIDIUM_ARN

ES_CLOUD_ID
ES_USER
ES_PWD

SEARCH_DCS_CIDS_INDEX
SEARCH_DCS_GOES_INDEX
SEARCH_DCS_IRIDIUM_INDEX

KAFKA_API_KEY
KAFKA_API_SECRET

S3_DCS_BUCKET
R2_DCS_BUCKET

AWS_ACCOUNT
AWS_REGION
R2_ACCOUNT_ID
R2_KEY
R2_SECRET_ACCESS_KEY

