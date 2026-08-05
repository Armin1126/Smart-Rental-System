package com.smartrental.service;

import com.smartrental.model.*;
import com.smartrental.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.Reader;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class DataImportService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataImportService.class);
    
    // Configured for running from backend directory where datasets are one level up
    private final String datasetsDir = "../datasets";

    private final AssetRepository assetRepository;
    private final SiteRepository siteRepository;
    private final OperatorRepository operatorRepository;
    private final RentalRecordRepository rentalRepository;
    private final TelemetryLogRepository telemetryRepository;
    private final AlertRepository alertRepository;
    private final RecommendationRepository recommendationRepository;

    public DataImportService(
            AssetRepository assetRepository,
            SiteRepository siteRepository,
            OperatorRepository operatorRepository,
            RentalRecordRepository rentalRepository,
            TelemetryLogRepository telemetryRepository,
            AlertRepository alertRepository,
            RecommendationRepository recommendationRepository) {
        this.assetRepository = assetRepository;
        this.siteRepository = siteRepository;
        this.operatorRepository = operatorRepository;
        this.rentalRepository = rentalRepository;
        this.telemetryRepository = telemetryRepository;
        this.alertRepository = alertRepository;
        this.recommendationRepository = recommendationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting initial data import from CSV files in {}", datasetsDir);
        importSites();
        importOperators();
        importAssets();
        importRentalRecords();
        importTelemetry();
        importAnomalies();
        importRecommendations();
        log.info("Data import completed successfully.");
    }

    private Double parseDoubleSafe(String val) {
        if (val == null || val.trim().isEmpty() || val.equalsIgnoreCase("NULL")) return null;
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseIntSafe(String val) {
        if (val == null || val.trim().isEmpty() || val.equalsIgnoreCase("NULL")) return null;
        try {
            // handle "1.0"
            return (int) Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolSafe(String val) {
        if (val == null || val.trim().isEmpty()) return false;
        return Boolean.parseBoolean(val.trim());
    }

    private String parseStrSafe(String val) {
        if (val == null || val.trim().isEmpty() || val.equalsIgnoreCase("NULL")) return null;
        return val.trim();
    }

    private void importSites() {
        Path path = Paths.get(datasetsDir, "sites.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            for (CSVRecord record : records) {
                String id = record.get("Site_ID");
                if (!siteRepository.existsById(id)) {
                    Site s = Site.builder()
                            .siteId(id)
                            .siteName(parseStrSafe(record.get("Site_Name")))
                            .location(parseStrSafe(record.get("Location")))
                            .latitude(parseDoubleSafe(record.get("Latitude")))
                            .longitude(parseDoubleSafe(record.get("Longitude")))
                            .managerName(parseStrSafe(record.get("Manager_Name")))
                            .contactPhone(parseStrSafe(record.get("Contact_Phone")))
                            .projectType(parseStrSafe(record.get("Project_Type")))
                            .startDate(parseStrSafe(record.get("Start_Date")))
                            .endDate(parseStrSafe(record.get("End_Date")))
                            .status(parseStrSafe(record.get("Status")))
                            .build();
                    siteRepository.save(s);
                    count++;
                }
            }
            log.info("Imported {} new Sites.", count);
        } catch (Exception e) {
            log.error("Failed to import sites.csv", e);
        }
    }

    private void importOperators() {
        Path path = Paths.get(datasetsDir, "operators.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            for (CSVRecord record : records) {
                String id = record.get("Operator_ID");
                if (!operatorRepository.existsById(id)) {
                    Operator o = Operator.builder()
                            .operatorId(id)
                            .firstName(parseStrSafe(record.get("First_Name")))
                            .lastName(parseStrSafe(record.get("Last_Name")))
                            .licenseType(parseStrSafe(record.get("License_Type")))
                            .licenseExpiry(parseStrSafe(record.get("License_Expiry")))
                            .yearsExperience(parseIntSafe(record.get("Years_Experience")))
                            .assignedSite(parseStrSafe(record.get("Assigned_Site")))
                            .status(parseStrSafe(record.get("Status")))
                            .certificationLevel(parseStrSafe(record.get("Certification_Level")))
                            .incidentCount(parseIntSafe(record.get("Incident_Count")))
                            .build();
                    operatorRepository.save(o);
                    count++;
                }
            }
            log.info("Imported {} new Operators.", count);
        } catch (Exception e) {
            log.error("Failed to import operators.csv", e);
        }
    }

    private void importAssets() {
        Path path = Paths.get(datasetsDir, "assets.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            for (CSVRecord record : records) {
                String id = record.get("Equipment_ID");
                if (!assetRepository.existsById(id)) {
                    Asset a = Asset.builder()
                            .equipmentId(id)
                            .equipmentType(parseStrSafe(record.get("Equipment_Type")))
                            .make(parseStrSafe(record.get("Make")))
                            .model(parseStrSafe(record.get("Model")))
                            .manufactureYear(parseIntSafe(record.get("Year")))
                            .purchaseDate(parseStrSafe(record.get("Purchase_Date")))
                            .currentSite(parseStrSafe(record.get("Current_Site")))
                            .status(parseStrSafe(record.get("Status")))
                            .dailyRentalRate(parseDoubleSafe(record.get("Daily_Rental_Rate")))
                            .currentValue(parseDoubleSafe(record.get("Current_Value")))
                            .expectedLifespanYears(parseIntSafe(record.get("Expected_Lifespan_Years")))
                            .engineHours(parseDoubleSafe(record.get("Engine_Hours")))
                            .idleHours(parseDoubleSafe(record.get("Idle_Hours")))
                            .build();
                    assetRepository.save(a);
                    count++;
                }
            }
            log.info("Imported {} new Assets.", count);
        } catch (Exception e) {
            log.error("Failed to import assets.csv", e);
        }
    }

    private void importRentalRecords() {
        Path path = Paths.get(datasetsDir, "rental_records.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            for (CSVRecord record : records) {
                String id = record.get("Rental_ID");
                if (!rentalRepository.existsById(id)) {
                    RentalRecord r = RentalRecord.builder()
                            .rentalId(id)
                            .equipmentId(parseStrSafe(record.get("Equipment_ID")))
                            .type(parseStrSafe(record.get("Type")))
                            .siteId(parseStrSafe(record.get("Site_ID")))
                            .checkInDate(parseStrSafe(record.get("Check_In_Date")))
                            .checkOutDate(parseStrSafe(record.get("Check_Out_Date")))
                            .originalReturnDate(parseStrSafe(record.get("Original_Return_Date")))
                            .actualReturnDate(parseStrSafe(record.get("Actual_Return_Date")))
                            .engineHoursDay(parseDoubleSafe(record.get("Engine_Hours_Day")))
                            .idleHoursDay(parseDoubleSafe(record.get("Idle_Hours_Day")))
                            .rentalDays(parseIntSafe(record.get("Rental_Days")))
                            .contractType(parseStrSafe(record.get("Contract_Type")))
                            .rentalStatus(parseStrSafe(record.get("Rental_Status")))
                            .isExtended(parseBoolSafe(record.get("Is_Extended")))
                            .extensionCount(parseIntSafe(record.get("Extension_Count")))
                            .lastOperatorId(parseStrSafe(record.get("Last_Operator_ID")))
                            .build();
                    rentalRepository.save(r);
                    count++;
                }
            }
            log.info("Imported {} new Rental Records.", count);
        } catch (Exception e) {
            log.error("Failed to import rental_records.csv", e);
        }
    }

    private void importTelemetry() {
        Path path = Paths.get(datasetsDir, "telemetry.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            for (CSVRecord record : records) {
                String id = record.get("Telemetry_ID");
                if (!telemetryRepository.existsById(id)) {
                    TelemetryLog t = TelemetryLog.builder()
                            .telemetryId(id)
                            .timestamp(parseStrSafe(record.get("Timestamp")))
                            .equipmentId(parseStrSafe(record.get("Equipment_ID")))
                            .latitude(parseDoubleSafe(record.get("Latitude")))
                            .longitude(parseDoubleSafe(record.get("Longitude")))
                            .speed(parseDoubleSafe(record.get("Speed")))
                            .operatingHours(parseDoubleSafe(record.get("Operating_Hours")))
                            .engineHours(parseDoubleSafe(record.get("Engine_Hours")))
                            .idleHours(parseDoubleSafe(record.get("Idle_Hours")))
                            .fuelUsedTotal(parseDoubleSafe(record.get("Fuel_Used_Total")))
                            .fuelUsedLast24H(parseDoubleSafe(record.get("Fuel_Used_Last_24H")))
                            .fuelRemainingPercentage(parseDoubleSafe(record.get("Fuel_Remaining_Percentage")))
                            .defRemainingPercentage(parseDoubleSafe(record.get("DEF_Remaining_Percentage")))
                            .engineCondition(parseStrSafe(record.get("Engine_Condition")))
                            .loadCount(parseIntSafe(record.get("Load_Count")))
                            .payloadTotal(parseDoubleSafe(record.get("Payload_Total")))
                            .diagnosticTroubleCode(parseStrSafe(record.get("Diagnostic_Trouble_Code")))
                            .gpsStatus(parseStrSafe(record.get("GPS_Status")))
                            .ignitionStatus(parseStrSafe(record.get("Ignition_Status")))
                            .build();
                    telemetryRepository.save(t);
                    count++;
                }
            }
            log.info("Imported {} new Telemetry Logs.", count);
        } catch (Exception e) {
            log.error("Failed to import telemetry.csv", e);
        }
    }

    private void importAnomalies() {
        Path path = Paths.get(datasetsDir, "anomalies.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            // Anomalies doesn't have an ID in the CSV, so we just clear and re-insert if we want,
            // or simply just insert. To prevent duplicates on restart without an ID column, 
            // we can delete all first, or just skip if any exist. Let's skip if table has data.
            if (alertRepository.count() > 0) {
                log.info("Alert table already has data. Skipping import.");
                return;
            }

            for (CSVRecord record : records) {
                Alert a = Alert.builder()
                        .assetId(parseStrSafe(record.get("Asset ID")))
                        .anomalyType(parseStrSafe(record.get("Anomaly Type")))
                        .severity(parseStrSafe(record.get("Severity")))
                        .description(parseStrSafe(record.get("Description")))
                        .timestamp(parseStrSafe(record.get("Timestamp")))
                        .recommendedAction(parseStrSafe(record.get("Recommended Action")))
                        .build();
                alertRepository.save(a);
                count++;
            }
            log.info("Imported {} new Alerts.", count);
        } catch (Exception e) {
            log.error("Failed to import anomalies.csv", e);
        }
    }

    private void importRecommendations() {
        Path path = Paths.get(datasetsDir, "recommendations.csv");
        if (!path.toFile().exists()) return;
        
        try (Reader in = new FileReader(path.toFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(in);
            int count = 0;
            
            if (recommendationRepository.count() > 0) {
                log.info("Recommendation table already has data. Skipping import.");
                return;
            }

            for (CSVRecord record : records) {
                Recommendation r = Recommendation.builder()
                        .equipmentId(parseStrSafe(record.get("Equipment_ID")))
                        .equipmentType(parseStrSafe(record.get("Equipment_Type")))
                        .currentSite(parseStrSafe(record.get("Current_Site")))
                        .action(parseStrSafe(record.get("Action")))
                        .priority(parseStrSafe(record.get("Priority")))
                        .justification(parseStrSafe(record.get("Justification")))
                        .build();
                recommendationRepository.save(r);
                count++;
            }
            log.info("Imported {} new Recommendations.", count);
        } catch (Exception e) {
            log.error("Failed to import recommendations.csv", e);
        }
    }

}
