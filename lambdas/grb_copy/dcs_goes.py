#
# Prototype Client App using SQS in Prototype to check test queue
#
#

import json
import urllib
import boto3
import os
import time
import xmltodict

GeoCloudQueueName1 = "pgc_queue"

sqs = boto3.resource('sqs', region_name='us-east-1')
queue1 = sqs.get_queue_by_name(QueueName=GeoCloudQueueName1)

s3 = boto3.client('s3')

#
# Process All Messages in the queue
#
def ProcessQueueMessages(queue):
    for message in queue.receive_messages():
        # print('body, {0}'.format(message.body))       
        
        OuterMessage = json.loads(message.body)
        InnerMessage = OuterMessage['Message']
        #InnerRecord = InnerMessage['Records'][0]
        data_dict = xmltodict.parse(InnerMessage)
        DcpMsg = data_dict['DcpMsg']
        print(DcpMsg)
        if 'MOMSM' in DcpMsg:
            printf("DONE")
            exit(-1)
        
        # Let the queue know that the message is processed
        message.delete()

#
# Main
#
#   Process All Messages in the queue
#   Sleep
#   Do it again
def main():
    #ProcessQueueMessages(queue1)
    done = False
    while( done != True):
        ProcessQueueMessages(queue1)
        #done = True
        time.sleep(0.1)
        print(' ')

if __name__ == "__main__":
    main()