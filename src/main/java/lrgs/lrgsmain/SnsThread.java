//
// Starts as a thread called by LrgsCmdLineArgs
// it gets messages from the queue and post them to SNS Topic
//
// Pat Cappelaere, IBM Consulting
//

// 
// snsT = new SnsThread(queueLogger)
// snsT.start()

package lrgs.lrgsmain;

import ilex.util.Logger;
import ilex.util.QueueLogger;
import ilex.util.IndexRangeException;

import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;

import java.lang.System;

public class SnsThread extends Thread {
	private static final String DCSMetricTopicArn = System.getenv("DCS_LOGS_ARN");

	/** The QueueLogger to read from */
	private QueueLogger qLogger;	
    
  /** shutdown flag */
	private boolean _shutdown;

  /** SNS Client  */
  private AmazonSNSClient snsClient;

	public SnsThread(QueueLogger ql) {
		qLogger = ql;
		_shutdown = false;

    if( DCSMetricTopicArn == null ) {
      Logger.instance().info("DCS_LOGS_ARN is not defined");
      _shutdown = true;
    } else {
      snsClient = new AmazonSNSClient();
    }
	}

	/** the Thread run method */
	public void run()	{
		try { sleep(1000L); } catch(InterruptedException ex) {}
		int idx = qLogger.getStartIdx();
		while(!_shutdown) 		{
			try 			{
				String msg = qLogger.getMsg(idx);
				if (msg == null) {
					sleep(500L);
				} else {
					// post to Sns Topic
          if( DCSMetricTopicArn != null ) {
            PublishResult result = snsClient.publish(new PublishRequest()
              .withTopicArn(DCSMetricTopicArn)
              .withMessage(msg));
          } 
					idx++;
				}
			}
			catch(InterruptedException ex) {}
			catch(IndexRangeException ex) {
				idx = qLogger.getNextIdx();
			}
		}
	}

  /** Sets the shutdown flag, causing the thread to exit. */
	public void shutdown() {
		_shutdown = true;
	}
}