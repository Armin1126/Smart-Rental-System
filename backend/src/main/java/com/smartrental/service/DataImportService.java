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
    private final com.smartrental.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public DataImportService(
            AssetRepository assetRepository,
            SiteRepository siteRepository,
            OperatorRepository operatorRepository,
            RentalRecordRepository rentalRepository,
            TelemetryLogRepository telemetryRepository,
            AlertRepository alertRepository,
            RecommendationRepository recommendationRepository,
            com.smartrental.repository.UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.assetRepository = assetRepository;
        this.siteRepository = siteRepository;
        this.operatorRepository = operatorRepository;
        this.rentalRepository = rentalRepository;
        this.telemetryRepository = telemetryRepository;
        this.alertRepository = alertRepository;
        this.recommendationRepository = recommendationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting initial data import from CSV files in {}", datasetsDir);
        try {
            assetRepository.deleteAll();
            rentalRepository.deleteAll();
        } catch (Exception e) {
            log.warn("Could not clear old asset/rental tables: {}", e.getMessage());
        }
        importUsers();
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
                try {
                    String id = record.get("Equipment_ID");
                    Asset a = Asset.builder().equipmentId(id).build();
                    a.setEquipmentType(parseStrSafe(record.get("Equipment_Type")));
                    a.setMake(parseStrSafe(record.get("Make")));
                    a.setModel(parseStrSafe(record.get("Model")));
                    a.setManufactureYear(parseIntSafe(record.get("Year")));
                    a.setPurchaseDate(record.isMapped("Purchase_Date") ? parseStrSafe(record.get("Purchase_Date")) : null);
                    a.setCurrentSite(parseStrSafe(record.isMapped("Site_ID") ? record.get("Site_ID") : (record.isMapped("Current_Site") ? record.get("Current_Site") : null)));
                    a.setStatus(parseStrSafe(record.get("Status")));
                    a.setDailyRentalRate(parseDoubleSafe(record.get("Daily_Rental_Rate")));
                    a.setCurrentValue(record.isMapped("Current_Value") ? parseDoubleSafe(record.get("Current_Value")) : null);
                    a.setExpectedLifespanYears(record.isMapped("Expected_Lifespan_Years") ? parseIntSafe(record.get("Expected_Lifespan_Years")) : null);
                    // Set engine/idle hours from CSV or generate realistic defaults
                    Double engineHrs = record.isMapped("Engine_Hours") ? parseDoubleSafe(record.get("Engine_Hours")) : null;
                    Double idleHrs = record.isMapped("Idle_Hours") ? parseDoubleSafe(record.get("Idle_Hours")) : null;
                    if (engineHrs == null) {
                        engineHrs = 1200.0 + (count * 47.5) % 800;
                    }
                    if (idleHrs == null) {
                        idleHrs = 150.0 + (count * 23.0) % 250;
                    }
                    a.setEngineHours(engineHrs);
                    a.setIdleHours(idleHrs);
                    assetRepository.save(a);
                    count++;
                } catch (Exception rowErr) {
                    log.warn("Skipping asset row: {}", rowErr.getMessage());
                }
            }
            log.info("Imported {} Assets into database.", count);
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
            rentalRepository.deleteAll();

            for (CSVRecord record : records) {
                String id = record.get("Rental_ID");
                String eqId = parseStrSafe(record.get("Equipment_ID"));
                
                // Map customer based on Equipment ID
                String custName = "Acme Construction Co.";
                String custCode = "CUST001";
                
                if (eqId != null) {
                    int eqNum = 1;
                    try {
                        eqNum = Integer.parseInt(eqId.replaceAll("\\D+", ""));
                    } catch (Exception ignored) {}

                    if (eqNum % 3 == 0 || eqId.equals("EQX1002") || eqId.equals("EQX1004") || eqId.equals("EQX1012")) {
                        custName = "Pacific Mining Ltd.";
                        custCode = "CUST002";
                    } else if (eqNum % 3 == 2 || eqId.equals("EQX1005") || eqId.equals("EQX1008") || eqId.equals("EQX1015")) {
                        custName = "Titan Earthworks Ltd.";
                        custCode = "CUST003";
                    }
                }

                RentalRecord r = RentalRecord.builder()
                        .rentalId(id)
                        .equipmentId(eqId)
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
                        .customerName(custName)
                        .customerCode(custCode)
                        .build();
                rentalRepository.save(r);
                count++;
            }
            log.info("Imported {} new Rental Records with customer mappings.", count);
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
            
            try {
                alertRepository.deleteAll();
            } catch (Exception e) {
                log.warn("Could not clear old alerts table: {}", e.getMessage());
            }

            for (CSVRecord record : records) {
                String assetId = parseStrSafe(record.isMapped("Asset_ID") ? record.get("Asset_ID") : (record.isMapped("Asset ID") ? record.get("Asset ID") : record.get("Equipment_ID")));
                String anomalyType = parseStrSafe(record.isMapped("Anomaly_Type") ? record.get("Anomaly_Type") : record.get("Anomaly Type"));
                String severity = parseStrSafe(record.get("Severity"));
                String description = parseStrSafe(record.get("Description"));
                String timestamp = parseStrSafe(record.get("Timestamp"));
                String recommendedAction = parseStrSafe(record.isMapped("Recommended_Action") ? record.get("Recommended_Action") : record.get("Recommended Action"));

                Alert a = Alert.builder()
                        .assetId(assetId)
                        .anomalyType(anomalyType)
                        .severity(severity)
                        .description(description)
                        .timestamp(timestamp)
                        .recommendedAction(recommendedAction)
                        .build();
                alertRepository.save(a);
                count++;
            }
            log.info("Imported {} new Alerts/Anomalies into database.", count);
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
            
            recommendationRepository.deleteAll();
            log.info("Cleared existing database recommendations prior to fresh import.");

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

    private void importUsers() {
        try {
            userRepository.deleteAll();
            com.smartrental.model.User dealer = com.smartrental.model.User.builder()
                    .email("dealer@cat.com")
                    .password(passwordEncoder.encode("dealer123"))
                    .fullName("CAT Dealer Operations Manager")
                    .role("DEALER")
                    .companyName("Caterpillar Fleet Management")
                    .customerCode("DEALER001")
                    .build();

            com.smartrental.model.User acmeCust = com.smartrental.model.User.builder()
                    .email("customer@acme.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("Acme Site Manager")
                    .role("CUSTOMER")
                    .companyName("Acme Construction Co.")
                    .customerCode("CUST001")
                    .build();

            com.smartrental.model.User pacificCust = com.smartrental.model.User.builder()
                    .email("customer@pacific.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("Pacific Infrastructure Director")
                    .role("CUSTOMER")
                    .companyName("Pacific Mining Ltd.")
                    .customerCode("CUST002")
                    .build();

            com.smartrental.model.User titanCust = com.smartrental.model.User.builder()
                    .email("customer@titan.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("Titan Earthworks Lead")
                    .role("CUSTOMER")
                    .companyName("Titan Earthworks Ltd.")
                    .customerCode("CUST003")
                    .build();

            userRepository.save(dealer);
            userRepository.save(acmeCust);
            userRepository.save(pacificCust);
            userRepository.save(titanCust);
            log.info("Successfully seeded Dealer and 3 distinct Customer accounts with BCrypt hashed passwords into PostgreSQL.");
        } catch (Exception e) {
            log.error("Failed to seed default user accounts: {}", e.getMessage());
        }
    }
}
