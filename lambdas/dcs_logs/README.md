# DCS_logs Lambda Function

It is called when log messages are generated by OpenDCS.
These messages are indexed into ElasticSearch

## Installation Notes
make zip
make aws
and install manually as lambda function with layer

### Environment Variables

ES_CLOUD_ID
ES_USER
ES_PWD
SEARCH_DCS_LOGS_INDEX