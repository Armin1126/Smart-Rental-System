package com.smartrental.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrental.dto.TelemetryLogDTO;
import com.smartrental.model.Asset;
import com.smartrental.model.TelemetryLog;
import com.smartrental.repository.AlertRepository;
import com.smartrental.repository.AssetRepository;
import com.smartrental.repository.TelemetryLogRepository;
import com.smartrental.websocket.TelemetryWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class TelemetrySimulatorService {

    private static final Logger log = LoggerFactory.getLogger(TelemetrySimulatorService.class);
    private final Random random = new Random();

    private final TelemetryLogRepository telemetryRepository;
    private final AssetRepository assetRepository;
    private final AlertRepository alertRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TelemetryWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;

    // Site base coordinates for fallback seed
    private static final double[][] SEED_COORDS = {
            {37.7749, -122.4194}, // San Francisco Depot
            {37.3382, -121.8863}, // Silicon Valley Hub
            {37.8044, -122.2712}, // Oakland Port Yard
            {38.5816, -121.4944}, // Sacramento Yard
            {37.3861, -121.9642}  // San Jose North
    };

    public TelemetrySimulatorService(TelemetryLogRepository telemetryRepository,
                                     AssetRepository assetRepository,
                                     AlertRepository alertRepository,
                                     SimpMessagingTemplate messagingTemplate,
                                     TelemetryWebSocketHandler webSocketHandler,
                                     ObjectMapper objectMapper) {
        this.telemetryRepository = telemetryRepository;
        this.assetRepository = assetRepository;
        this.alertRepository = alertRepository;
        this.messagingTemplate = messagingTemplate;
        this.webSocketHandler = webSocketHandler;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void runTelemetrySimulationCycle() {
        List<Asset> assets = assetRepository.findAll();
        if (assets.isEmpty()) {
            seedDefaultAssets();
            assets = assetRepository.findAll();
        }

        if (assets.isEmpty()) {
            log.warn("No assets available for telemetry simulation.");
            return;
        }

        // Dynamically simulate active telemetry across all genuine fleet assets in database
        for (Asset asset : assets) {
            if (random.nextDouble() < 0.35) { // ~14-15 assets updated per tick continuously
                simulateSingleAssetTelemetry(asset);
            }
        }
    }

    private void simulateSingleAssetTelemetry(Asset asset) {
        String nowIso = DateTimeFormatter.ISO_INSTANT.format(Instant.now());

        // Fetch latest telemetry record to compute realistic continuous telemetry delta
        List<TelemetryLog> existingLogs = telemetryRepository.findByEquipmentId(asset.getEquipmentId());
        TelemetryLog latestLog = existingLogs.isEmpty() ? null : existingLogs.get(existingLogs.size() - 1);

        String previousIgnition = latestLog != null && latestLog.getIgnitionStatus() != null
                ? latestLog.getIgnitionStatus()
                : "ON";

        // Determine realistic operating state:
        // 75% Active Duty (ON), 15% Standby (IDLE), 10% Parked/Stationary (OFF)
        double stateRoll = random.nextDouble();
        String currentIgnition = stateRoll < 0.75 ? "ON" : (stateRoll < 0.90 ? "IDLE" : "OFF");

        // Realistic continuous fuel level (default 78-85%)
        double currentFuel = latestLog != null && latestLog.getFuelRemainingPercentage() != null
                ? latestLog.getFuelRemainingPercentage()
                : 78.5;

        // Fuel consumption logic based on operating state:
        // OFF: 0.0% fuel drop (Stationary / Off-Shift)
        // IDLE: 0.01% - 0.03% fuel drop per 5s tick
        // ON: 0.12% - 0.28% fuel drop per 5s tick
        double fuelDelta = 0.0;
        if ("ON".equalsIgnoreCase(currentIgnition)) {
            fuelDelta = 0.12 + (0.16 * random.nextDouble());
        } else if ("IDLE".equalsIgnoreCase(currentIgnition)) {
            fuelDelta = 0.02 + (0.03 * random.nextDouble());
        } else {
            fuelDelta = 0.0; // Stationary / Off-Shift: Zero fuel drop!
        }

        double updatedFuel = Math.max(15.0, currentFuel - fuelDelta);
        if (updatedFuel <= 18.0 && random.nextDouble() < 0.4) {
            updatedFuel = 92.0 + (6.0 * random.nextDouble()); // Tank refueled at depot
        }

        // Engine hours & Idle hours delta calculation
        double currentEngineHours = asset.getEngineHours() != null
                ? asset.getEngineHours()
                : (latestLog != null && latestLog.getEngineHours() != null ? latestLog.getEngineHours() : 1250.0);
        double engineHoursDelta = "ON".equalsIgnoreCase(currentIgnition) ? 0.0014 : 0.0;
        double updatedEngineHours = Math.round((currentEngineHours + engineHoursDelta) * 1000.0) / 1000.0;

        double currentIdleHours = asset.getIdleHours() != null
                ? asset.getIdleHours()
                : (latestLog != null && latestLog.getIdleHours() != null ? latestLog.getIdleHours() : 185.0);
        double idleHoursDelta = "IDLE".equalsIgnoreCase(currentIgnition) ? 0.0014 : 0.0;
        double updatedIdleHours = Math.round((currentIdleHours + idleHoursDelta) * 1000.0) / 1000.0;

        // Realistic Micro GPS Movement (+/- 0.00005 degrees = ~5 meters work site repositioning)
        double currentLat = latestLog != null && latestLog.getLatitude() != null
                ? latestLog.getLatitude()
                : SEED_COORDS[Math.abs(asset.getEquipmentId().hashCode()) % SEED_COORDS.length][0];
        double currentLng = latestLog != null && latestLog.getLongitude() != null
                ? latestLog.getLongitude()
                : SEED_COORDS[Math.abs(asset.getEquipmentId().hashCode()) % SEED_COORDS.length][1];

        double latDrift = "ON".equalsIgnoreCase(currentIgnition) ? (random.nextDouble() - 0.5) * 0.0001 : 0.0;
        double lngDrift = "ON".equalsIgnoreCase(currentIgnition) ? (random.nextDouble() - 0.5) * 0.0001 : 0.0;
        double updatedLat = Math.round((currentLat + latDrift) * 100000.0) / 100000.0;
        double updatedLng = Math.round((currentLng + lngDrift) * 100000.0) / 100000.0;

        double currentSpeed = "ON".equalsIgnoreCase(currentIgnition) ? Math.round((8.0 + random.nextDouble() * 14.0) * 10.0) / 10.0 : 0.0;

        // Fault Code Distribution (96% Normal, 4% warning on EQX1004)
        String dtcCode = null;
        String engineCondition = "NORMAL";
        if ("EQX1004".equalsIgnoreCase(asset.getEquipmentId()) && random.nextDouble() < 0.15) {
            dtcCode = "P0217_ELEVATED_TEMP";
            engineCondition = "WARNING";
        }

        // 1. Create and save TelemetryLog in PostgreSQL
        TelemetryLog telemetryLog = TelemetryLog.builder()
                .telemetryId("TEL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .timestamp(nowIso)
                .equipmentId(asset.getEquipmentId())
                .latitude(updatedLat)
                .longitude(updatedLng)
                .speed(currentSpeed)
                .operatingHours(updatedEngineHours - updatedIdleHours)
                .engineHours(updatedEngineHours)
                .idleHours(updatedIdleHours)
                .fuelUsedTotal(latestLog != null && latestLog.getFuelUsedTotal() != null ? latestLog.getFuelUsedTotal() + (fuelDelta * 0.5) : 340.0)
                .fuelUsedLast24H(18.5)
                .fuelRemainingPercentage(Math.round(updatedFuel * 100.0) / 100.0)
                .defRemainingPercentage(85.0)
                .engineCondition(engineCondition)
                .loadCount(latestLog != null && latestLog.getLoadCount() != null ? latestLog.getLoadCount() + (random.nextInt(10) == 0 ? 1 : 0) : 18)
                .payloadTotal(1450.0)
                .diagnosticTroubleCode(dtcCode)
                .gpsStatus("LOCK")
                .ignitionStatus(currentIgnition)
                .build();

        telemetryRepository.save(telemetryLog);

        // 2. Persist updated asset metrics into PostgreSQL
        asset.setEngineHours(updatedEngineHours);
        asset.setIdleHours(updatedIdleHours);
        assetRepository.save(asset);

        // 3. Broadcast to STOMP and Native WebSocket
        TelemetryLogDTO dto = mapToDTO(telemetryLog);
        try {
            messagingTemplate.convertAndSend("/topic/telemetry", dto);
            String jsonPayload = objectMapper.writeValueAsString(dto);
            webSocketHandler.broadcast(jsonPayload);

            log.info("Simulated telemetry update for asset [{}]: Fuel={}% | EngineHours={}h | GPS=({},{}) | Condition={}",
                    asset.getEquipmentId(), dto.getFuelRemainingPercentage(), dto.getEngineHours(),
                    dto.getLatitude(), dto.getLongitude(), dto.getEngineCondition());
        } catch (Exception e) {
            log.error("Failed to broadcast telemetry update over WebSocket: {}", e.getMessage(), e);
        }
    }

    private TelemetryLogDTO mapToDTO(TelemetryLog t) {
        return TelemetryLogDTO.builder()
                .telemetryId(t.getTelemetryId())
                .timestamp(t.getTimestamp())
                .equipmentId(t.getEquipmentId())
                .latitude(t.getLatitude())
                .longitude(t.getLongitude())
                .speed(t.getSpeed())
                .operatingHours(t.getOperatingHours())
                .engineHours(t.getEngineHours())
                .idleHours(t.getIdleHours())
                .fuelUsedTotal(t.getFuelUsedTotal())
                .fuelUsedLast24H(t.getFuelUsedLast24H())
                .fuelRemainingPercentage(t.getFuelRemainingPercentage())
                .defRemainingPercentage(t.getDefRemainingPercentage())
                .engineCondition(t.getEngineCondition())
                .loadCount(t.getLoadCount())
                .payloadTotal(t.getPayloadTotal())
                .diagnosticTroubleCode(t.getDiagnosticTroubleCode())
                .gpsStatus(t.getGpsStatus())
                .ignitionStatus(t.getIgnitionStatus())
                .build();
    }

    private void seedDefaultAssets() {
        String[] types = {"Excavator", "Bulldozer", "Wheel Loader", "Backhoe", "Scissor Lift"};
        String[] makes = {"CAT", "Komatsu", "Volvo", "JCB", "Genie"};

        for (int i = 1; i <= 5; i++) {
            String eqId = "EQX100" + i;
            Asset asset = Asset.builder()
                    .equipmentId(eqId)
                    .equipmentType(types[(i - 1) % types.length])
                    .make(makes[(i - 1) % makes.length])
                    .model("Series-" + (200 + i))
                    .manufactureYear(2021 + (i % 3))
                    .purchaseDate("2022-01-15")
                    .currentSite("S00" + i)
                    .status("IN_USE")
                    .dailyRentalRate(450.0 + (i * 50))
                    .currentValue(85000.0)
                    .expectedLifespanYears(10)
                    .engineHours(1200.0 + (i * 150))
                    .idleHours(180.0 + (i * 20))
                    .build();
            assetRepository.save(asset);
        }
        log.info("Seeded default assets into database for simulation.");
    }
}
