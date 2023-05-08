package examples;

import java.util.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;

import org.xml.sax.SAXException;
import javax.xml.parsers.ParserConfigurationException;

import decodes.datasource.RawMessage;
import decodes.db.Platform;
import decodes.db.TransportMedium;
import decodes.db.DecodesScript;
import decodes.db.DatabaseObject;
import decodes.db.Platform;
import decodes.db.PlatformList;
import decodes.db.PlatformConfig;
import decodes.db.PresentationGroup;
import decodes.db.TransportMedium;
// import decodes.db.TransportationGroup;
import decodes.db.PlatformStatus;
import decodes.xml.TopLevelParser;
import decodes.xml.PlatformListParser;
import ilex.util.Logger;
import ilex.var.Variable;
import decodes.decoder.DecoderException;
import decodes.db.InvalidDatabaseException;
import decodes.db.DatabaseException;
import decodes.db.IncompleteDatabaseException;
import decodes.datasource.UnknownPlatformException;

import decodes.decoder.DecodedMessage;
import decodes.decoder.DecodesFunction;
import decodes.decoder.FunctionList;
import decodes.decoder.Nos6Min;
import decodes.decoder.SummaryReportGenerator;
import decodes.decoder.Sensor;
import decodes.decoder.TimeSeries;

import ilex.util.TextUtil;
import ilex.var.TimedVariable;

import decodes.db.Site;
import decodes.db.SiteName;
import decodes.db.Constants;
import decodes.db.DataType;
import ilex.var.NoConversionException;
import ilex.var.IFlags;

public class DecodesExample {
    private static Boolean GENERATE_SUMMARY_REPORT = false;

    public static String makeJsonReport(DecodedMessage decmsg, RawMessage rm)
            throws NoConversionException, UnknownPlatformException {

        Platform plat = decmsg.getPlatform();
        PlatformConfig config = plat.getConfig();
        TransportMedium tm = rm.getTransportMedium();

        Site platSite = plat.getSite();
        Date summaryEndTime = null;
        String pattern = "yyyy-MM-dd HH:mm:ss.SSSZ";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        NumberFormat numberFormat = NumberFormat.getInstance();
        numberFormat.setMinimumFractionDigits(2);
        numberFormat.setMaximumFractionDigits(2);
        numberFormat.setGroupingUsed(false);

        String newline = System.getProperty("os.name").toLowerCase().startsWith("win")
                ? "\r\n"
                : "\n";

        StringBuilder sb = new StringBuilder();
        sb.setLength(0);

        ArrayList<Site> extraSites = new ArrayList<Site>();
        for (Iterator tsit = decmsg.getAllTimeSeries(); tsit.hasNext();) {
            TimeSeries ts = (TimeSeries) tsit.next();
            Site tsSite = ts.getSensor().getSensorSite();
            if (tsSite != null && tsSite != platSite && !extraSites.contains(tsSite))
                extraSites.add(tsSite);
        }
        extraSites.add(platSite);

        for (Site site : extraSites) {
            SiteName siteName = site.getName(Constants.snt_USGS);
            if (siteName == null)
                siteName = site.getPreferredName();

            sb.append("{" + newline);
            sb.append("  \"Platform\": \"" + plat.makeFileName() + "\"," + newline);
            sb.append("  \"TransportMedium\": \"" + tm.makeFileName() + "\"," + newline);
            sb.append("  \"Station\": \"" + siteName.getNameValue() + "\"," + newline);
            sb.append("  \"Sensors\": [" + newline);

            for (Iterator tsit = decmsg.getAllTimeSeries(); tsit.hasNext();) {
                TimeSeries ts = (TimeSeries) tsit.next();
                Site tsSite = ts.getSensor().getSensorSite();
                if (ts.size() > 0 && (tsSite == site || (tsSite == null && site == platSite))) {
                    Sensor sensor = ts.getSensor();
                    sb.append("    {" + newline);
                    sb.append("      \"Sensor\": \"" + sensor.getName() + "\",");
                    sb.append(newline);

                    DataType dt = sensor.getDataType(Constants.datatype_EPA);
                    if (dt == null)
                        dt = sensor.getDataType(Constants.datatype_USGS);
                    if (dt == null)
                        dt = sensor.getDataType();
                    if (dt != null)
                        sb.append("      \"ParameterCode\" : \"" + dt.getCode() + "\"," + newline);

                    ArrayList<TimedVariable> vars = new ArrayList<TimedVariable>();
                    int nsamples = ts.size();
                    for (int idx = 0; idx < nsamples; idx++) {
                        TimedVariable tv = ts.sampleAt(idx);
                        vars.add(tv);
                    }
                    int idx = 0;
                    int numErrors = 0;
                    int numOutLim = 0;
                    sb.append("      \"Values\" : [");
                    while (idx < vars.size()) {
                        while (idx < vars.size()) {
                            TimedVariable tv = vars.get(idx);
                            summaryEndTime = tv.getTime();

                            if ((tv.getFlags() & IFlags.LIMIT_VIOLATION) != 0)
                                numOutLim++;
                            else if ((tv.getFlags() & IFlags.IS_ERROR) != 0)
                                numErrors++;
                            else {
                                try {
                                    Double d = tv.getDoubleValue();
                                    sb.append(d.toString());
                                    if (idx < (vars.size() - 1)) {
                                        sb.append(",");
                                    }
                                } catch (NoConversionException ex) {
                                    Logger.instance().warning("Skipped non numeric sample.");
                                }
                            }
                            idx++;
                        }
                        sb.append("]" + newline);
                    }
                    sb.append("    }," + newline);
                }
            }
            if (sb.length() > 0) {
                sb.deleteCharAt(sb.length() - 2);
            }
            sb.append("  ]," + newline);
            sb.append("  \"EndTime\": \"" + simpleDateFormat.format(summaryEndTime) + "\"}" + newline);
        }

        return sb.toString();
    }

    public static DecodedMessage attemptDecode(RawMessage rm, PlatformStatus platstat) {
        DecodedMessage dm = null;
        PresentationGroup presentationGroup = null;
        ArrayList<String> includePMs = null;

        try {
            Platform p = rm.getPlatform();
            PlatformConfig config = p.getConfig();
            DecodesScript ds = config.getScript("st");

            TransportMedium tm = rm.getTransportMedium();
            tm.setDecodesScript(ds);

            Logger.instance().info("Message is for platform '" + p.makeFileName()
                    + "' with transport medium '" + tm.makeFileName() + "' and script '"
                    + tm.scriptName + "'");

            // Get decodes script & use it to decode message.
            ds = tm.getDecodesScript();
            if (ds == null)
                throw new InvalidDatabaseException(
                        "Transport medium does not have a DecodesScript");

            DecodesFunction df = new Nos6Min().makeCopy();
            FunctionList.addFunction(df);

            ds.setIncludePMs(includePMs);
            ds.prepareForExec();

            dm = ds.decodeMessage(rm);
            dm.applyScaleAndOffset();

        } catch (DecoderException ex) {
            System.err.println("DecoderException: " + ex);
            ex.printStackTrace(System.err);
            return null;
        } catch (InvalidDatabaseException ex) {
            System.err.println("InvalidDatabaseException: " + ex);
            ex.printStackTrace(System.err);
            return null;
        } catch (IncompleteDatabaseException ex) {
            System.err.println("IncompleteDatabaseException: " + ex);
            ex.printStackTrace(System.err);
            return null;
        } catch (UnknownPlatformException ex) {
            System.err.println("UnknownPlatformException: " + ex);
            ex.printStackTrace(System.err);
            return null;
        }
        return dm;
    }

    public static DecodedMessage decodeMessage(RawMessage rm, String mediumType, String mediumId,
            PlatformList platformList)
            throws DatabaseException {
        Logger.instance().info("Decoding message for medium type '" + mediumType + "' id '" + mediumId + "'");
        Platform platform = platformList.findPlatform(mediumType, mediumId, new Date());
        if (platform == null) {
            Logger.instance().warning("No platform found for medium type '" + mediumType + "' id '" + mediumId + "'");
            return null;
        }
        rm.setPlatform(platform);

        TransportMedium tm = platform.getTransportMedium(mediumType);
        rm.setTransportMedium(tm);

        PlatformStatus platstat = new PlatformStatus(platform.getId());

        DecodedMessage dm = attemptDecode(rm, platstat);
        return dm;
    }

    public static Platform readPlatform(TopLevelParser parser, File platformFile)
            throws IOException, SAXException, ParserConfigurationException {
        DatabaseObject obj = parser.parse(platformFile);
        Platform platform = (Platform) obj;
        return platform;
    }

    public static PlatformList addPlatformFiles(File[] files)
            throws IOException, SAXException, ParserConfigurationException {
        TopLevelParser parser = new TopLevelParser();
        PlatformList platformList = new PlatformList();

        for (File file : files) {
            Logger.instance().info("Reading platform file '" + file.getName() + "'");
            Platform platform = readPlatform(parser, file);
            platformList.add(platform);
        }
        return platformList;
    }

    //
    // Builds platformList from all platform files in specified directory
    //
    public static PlatformList buildPlatformList()
            throws IOException, SAXException, ParserConfigurationException {
        File dir = new File("./platform");
        return addPlatformFiles(dir.listFiles());
    }

    public static JsonObject DecodeMessageFile(PlatformList platformList, String msgFileName)
            throws FileNotFoundException, DatabaseException, NoConversionException, UnknownPlatformException,
            DecoderException, InvalidDatabaseException, IncompleteDatabaseException {

        // parse json file
        JsonParser parser = new JsonParser();
        JsonObject obj = parser.parse(new FileReader(msgFileName)).getAsJsonObject();
        Logger.instance().info("JSON: " + obj.toString());

        String rawData = obj.get("RawData").getAsString();
        String mediumId = obj.get("platformId").getAsString();
        String mediumType = "goes-self-timed";

        Logger.instance().info("Data " + rawData);

        RawMessage rm = new RawMessage(rawData.getBytes());
        rm.setHeaderLength(37);

        DecodedMessage dm = decodeMessage(rm, mediumType, mediumId, platformList);
        if (dm != null) {
            if (GENERATE_SUMMARY_REPORT) {
                SummaryReportGenerator summary = new SummaryReportGenerator();
                String summaryReport = summary.makeReport(dm, "Kafka NRT");
                Logger.instance().info("Summary Report: " + summaryReport);
            }
            String json = makeJsonReport(dm, rm);
            // Logger.instance().info("JSON: " + json);

            JsonObject xobj = parser.parse(new StringReader(json)).getAsJsonObject();
            obj.add("DecodedData", xobj);
            return obj;
        } else {
            return null;
        }
    }

    public static void main(final String[] args) throws Exception {
        // Logger.instance().setMinLogPriority(Logger.E_DEBUG3);

        String msgFileName = args[0];
        Logger.instance().info("Decoding message file '" + msgFileName + "'");

        PlatformList platformList = buildPlatformList();

        JsonObject obj = DecodeMessageFile(platformList, msgFileName);
        if (obj != null) {
            Logger.instance().info(obj.toString());
        }
    }
}
