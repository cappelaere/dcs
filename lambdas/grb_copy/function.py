#
# Prototype Client App using SQS in GeoCloud to copy GRB data to prototype area
#
#

import json
import urllib
import boto3
import os
import time

TARGET_BUCKET = 'grbprototype'

GeoCloudQueueName1 = "pgc-queue"
GeoCloudQueueName2 = "pgc_queue_2"

sqs = boto3.resource('sqs', region_name='us-east-1')
queue1 = sqs.get_queue_by_name(QueueName=GeoCloudQueueName1)
queue2 = sqs.get_queue_by_name(QueueName=GeoCloudQueueName2)
s3 = boto3.client('s3')

#
# Process All Messages in the queue
#
def ProcessQueueMessages(queue):
    for message in queue.receive_messages():
        # print('body, {0}'.format(message.body))       
        
        OuterMessage = json.loads(message.body)
        InnerMessage = json.loads(OuterMessage['Message'])
        InnerRecord = InnerMessage['Records'][0]
        source_bucket = InnerRecord['s3']['bucket']['name']
        source_key = urllib.parse.unquote_plus(InnerRecord['s3']['object']['key'])

        s3_resource = boto3.resource('s3', region_name='us-east-1')
        copy_source = {
            'Bucket': source_bucket,
            'Key': source_key
        }
        target_key = source_key 

        print('s3 copy from', source_bucket, source_key, 'to', TARGET_BUCKET, target_key)
        s3_resource.Bucket(TARGET_BUCKET).Object(target_key).copy(copy_source, ExtraArgs={'ACL': 'bucket-owner-full-control'})

        print('done')
        # Let the queue know that the message is processed
        message.delete()

#
# Main
#
#   Process All Messages in the queue
#   Sleep
#   Do it again
def main():
    while(True):
        ProcessQueueMessages(queue1)
        ProcessQueueMessages(queue2)
        time.sleep(0.1)

if __name__ == "__main__":
    main()