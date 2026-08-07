package com.smartrental.service;

import com.smartrental.dto.TelemetryLogDTO;
import com.smartrental.model.TelemetryLog;
import com.smartrental.repository.TelemetryLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TelemetryService {

    private final TelemetryLogRepository telemetryRepository;

    public TelemetryService(TelemetryLogRepository telemetryRepository) {
        this.telemetryRepository = telemetryRepository;
    }

    public List<TelemetryLogDTO> getTelemetryByAssetId(String assetId) {
        List<TelemetryLog> logs = telemetryRepository.findTop50ByEquipmentIdOrderByTimestampDesc(assetId);
        java.util.Collections.reverse(logs);
        return logs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
}
