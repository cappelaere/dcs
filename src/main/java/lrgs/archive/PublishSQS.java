import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import java.util.Date;
import java.util.List;


public class Publish {
  private static final String queueUrl = "https://sqs.us-east-1.amazonaws.com/323017588889/DCS-Q";

  public static void Send(String xml) {
    final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
    SendMessageRequest send_msg_request = new SendMessageRequest()
        .withQueueUrl(queueUrl)
        .withMessageBody(xml)
        .withDelaySeconds(5);

    sqs.sendMessage(send_msg_request);
  }

  // public static void main(String[] args)  {
  //   String xml ="<xml>This is a test</xml>";
  //   Publish.Send(xml);
  // }
}