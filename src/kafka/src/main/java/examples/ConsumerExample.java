package examples;

import org.apache.kafka.clients.consumer.*;

import java.time.Duration;
import java.util.Arrays;
import java.util.Properties;
import java.util.regex.Pattern;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.text.SimpleDateFormat;
import java.text.ParseException;

import java.util.Date;

import com.google.gson.Gson;

import lrgs.lrgsmain.LrgsInputInterface;
import lrgs.archive.MsgArchive;
import lrgs.common.DcpMsg;
import lrgs.common.DcpMsgFlag;
import lrgs.ldds.ExtBlockXmlParser;
import lrgs.ldds.ProtocolError;
import ilex.xml.XmlOutputStream;

public class ConsumerExample {

     public class DCP {
        private String flags;
        private String platformId;
        private String sat;

        // Iridium specifc
        private String XmitTime;
        private String MOMSM;
        private String CDR_Reference;
        private int SessionStatus;

        private int DomsatSeq;
        private String DomsatTime;
        private String CarrierStart; 
        private String CarrierStop; 
        private int Baud;
        private float GoodPhasePct;
        private float FreqOffset;
        private float SignalStrength;
        private float PhaseNoise;
        private String LocalRecvTime; 
        private String BinaryMsg; 

        public String toXML() {
            String xml = "<DcpMsg flags=\"" + this.flags + "\" platformId=\""+ this.platformId + "\" >\n";
            xml += "\t<DomsatSeq>"+this.DomsatSeq+"</DomsatSeq>\n";

            System.out.println(this.sat);

            if( this.sat.equals("goes")) {
                xml += "\t<DomsatTime>"+this.DomsatTime+"</DomsatTime>\n";
                xml += "\t<CarrierStart>"+this.CarrierStart+"</CarrierStart>\n";
                xml += "\t<CarrierStop>"+this.CarrierStop+"</CarrierStop>\n";
                xml += "\t<Baud>"+this.Baud+"</Baud>\n";
                xml += "\t<GoodPhasePct>"+this.GoodPhasePct+"</GoodPhasePct>\n";
                xml += "\t<FreqOffset>"+this.FreqOffset+"</FreqOffset>\n";
                xml += "\t<SignalStrength>"+this.SignalStrength+"</SignalStrength>\n";
                xml += "\t<PhaseNoise>"+this.PhaseNoise+"</PhaseNoise>\n";
            } else {
                xml += "\t<XmitTime>"+this.XmitTime+"</XmitTime>\n";
                xml += "\t<MOMSM>"+this.MOMSM+"</MOMSM>\n";
                xml += "\t<CDR_Reference>"+this.CDR_Reference+"</CDR_Reference>\n";
                xml += "\t<SessionStatus>"+this.SessionStatus+"</SessionStatus>\n";
            }

            xml += "\t<LocalRecvTime>"+this.LocalRecvTime+"</LocalRecvTime>\n";
            xml += "\t<BinaryMsg>"+this.BinaryMsg+"</BinaryMsg>\n";
            xml += "</DcpMsg>\n";
            return xml;
        }
    }

    public static Properties loadConfig(final String configFile) throws IOException {
        if (!Files.exists(Paths.get(configFile))) {
            throw new IOException(configFile + " not found.");
        }
        final Properties cfg = new Properties();
        try (InputStream inputStream = new FileInputStream(configFile)) {
            cfg.load(inputStream);
        }
        return cfg;
    }
    
    public static void StoreMessage( final String value, MsgArchive archive, ExtBlockXmlParser xmlParser ) throws ParseException, IOException, ProtocolError, InterruptedException {
        Gson gson = new Gson();

        DCP object = gson.fromJson(value, DCP.class);
        System.out.println(gson.toJson(object));  

        SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss");
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy/ddd hh:mm:ss.sss");

        Date date = parser.parse(object.CarrierStart);
        object.CarrierStart = formatter.format(date);

        date = parser.parse(object.CarrierStop);
        object.CarrierStop = formatter.format(date);

        date = parser.parse(object.LocalRecvTime);
        object.LocalRecvTime = formatter.format(date);

        object.DomsatTime = "1970/001 00:00:00.000";

        String DcpXml = object.toXML();
        // System.out.println(DcpXml);  

        byte[] msgBuf = DcpXml.getBytes();
        DcpMsg msg =  xmlParser.parseDcpMsg(msgBuf);
        // System.out.println("XML Parsed");

        LrgsInputInterface src = null;
        try {
            archive.archiveMsg(msg, src);
        } catch( java.lang.NoClassDefFoundError ex) {
        }
    }

    public static void main(final String[] args) throws Exception {
        if (args.length != 1) {
            System.out.println("Please provide the topic of interest as a command line argument");
            System.exit(1);
        }

        final String topic = args[0];
        final String ConfigFile="kafka.properties";
   	    MsgArchive archive = new MsgArchive("./archive");

        archive.init();

        ExtBlockXmlParser xmlParser = new ExtBlockXmlParser(0);
        ByteArrayOutputStream baos = new ByteArrayOutputStream(DcpMsg.MAX_DATA_LENGTH);
		XmlOutputStream xos = new XmlOutputStream(baos, ExtBlockXmlParser.DcpMsgElem);
		byte[] xmlMsgBuf = new byte[DcpMsg.MAX_DATA_LENGTH];

        // Load consumer configuration settings from a local file
        // Reusing the loadConfig method from the ProducerExample class
        final Properties props = loadConfig(ConfigFile);
        
        // Add additional properties.
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-java-getting-started");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        try (final Consumer<String, String> consumer = new KafkaConsumer<>(props)) {

            if( topic.contains("*")) {
                Pattern pattern = Pattern.compile(topic);
                consumer.subscribe(pattern);
            } else {
                List<String> list;
                if( topic.contains(",")) {
                    list = Arrays.asList(topic.split(","));
                } else {
                    list = Arrays.asList(topic);
                }
                
                System.out.println("Subscribing to " + list);
                consumer.subscribe(list);             
            }
           
            while (true) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
                for (ConsumerRecord<String, String> record : records) {
                    String t = record.topic();
                    String key = record.key();
                    String value = record.value();
                    System.out.println(
                            String.format("Consumed event from topic %s: key = %-10s value = %s", t, key, value));
                    StoreMessage(value, archive, xmlParser);
                }
            }
        } 
        catch(InterruptedException e) {
            System.out.println("Closing archive...");
            archive.shutdown();
        }
        catch(ProtocolError e) {
            System.out.println("Closing archive...");
            archive.shutdown();
        } 
        catch(ParseException e) {
            System.out.println("Closing archive...");
            archive.shutdown();
        } 
        catch(IOException e) {
            System.out.println("Closing archive...");
            archive.shutdown();
        } 
        catch(org.apache.kafka.common.errors.InvalidTopicException e) {
            System.out.println("InvalidTopicException "+e);
            System.out.println("Closing archive...");
            archive.shutdown();
        } 
    }
}