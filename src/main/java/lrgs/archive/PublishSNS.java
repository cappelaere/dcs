// 
// Publish metrics and DCS DCP using SNS
//
// Pat Cappelaere, IBM Consulting
//
package lrgs.archive;

import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;

import java.io.IOException;
import java.io.ByteArrayOutputStream;
import ilex.xml.XmlOutputStream;
import lrgs.common.*;
import lrgs.lrgsmain.LrgsConfig;
import lrgs.statusxml.StatusXmlTags;
import lrgs.statusxml.LrgsStatusSnapshotExt;
import lrgs.statusxml.LrgsStatusSnapshotXio;

import java.lang.System;

public class PublishSNS {
  
  private static final String DCSGoesMessageTopicArn = System.getenv("DCS_GOES_ARN");
  private static final String DCSIridiumMessageTopicArn = System.getenv("DCS_IRIDIUM_ARN");
  private static final String DCSMetricTopicArn = System.getenv("DCS_METRICS_ARN");

  public static void SendGoesMessage(String xml) {
    final AmazonSNSClient snsClient = new AmazonSNSClient();

    if( DCSGoesMessageTopicArn != null ) {
       PublishResult result = snsClient.publish(new PublishRequest()
        .withTopicArn(DCSGoesMessageTopicArn)
        .withMessage(xml));
    } else {
      Logger.instance().warning("DCS_GOES_ARN undefined");
    }
  }

  public static void SendIridiumMessage(String xml) {
    final AmazonSNSClient snsClient = new AmazonSNSClient();

    if( DCSIridiumMessageTopicArn != null ) {
       PublishResult result = snsClient.publish(new PublishRequest()
        .withTopicArn(DCSIridiumMessageTopicArn)
        .withMessage(xml));
    } else {
      Logger.instance().warning("DCS_IRIDIUM_ARN undefined");
    }
  }

  public static void SendMetrics(LrgsStatusSnapshotExt lsse) {

    final AmazonSNSClient snsClient = new AmazonSNSClient();

    if( DCSMetricTopicArn != null )
      try {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        XmlOutputStream xos = 
          new XmlOutputStream(baos, StatusXmlTags.LrgsStatusSnapshot);

        LrgsStatusSnapshotXio lssxio = new LrgsStatusSnapshotXio(lsse);
        // lssxio.setHideHostNames(
        //   LrgsConfig.instance().getMiscBooleanProperty("hideHostNames", false)
        //   && !ldds.user.isAdmin);
        lssxio.writeXml(xos);

        String metrics = new String(baos.toByteArray());

        PublishResult result = snsClient.publish(new PublishRequest()
          .withTopicArn(DCSMetricTopicArn)
          .withMessage(metrics));
      } catch(IOException e) {

      }
    } else {
      logger.instance().warning("DCS_METRICS_ARN undefined");
    }
  }
}