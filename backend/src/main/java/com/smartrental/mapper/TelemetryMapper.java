package com.smartrental.mapper;

import com.smartrental.dto.TelemetryLogDto;
import com.smartrental.entity.TelemetryLog;
import org.springframework.stereotype.Component;

@Component
public class TelemetryMapper {

    public TelemetryLogDto toDto(TelemetryLog log) {
        if (log == null) return null;
        return TelemetryLogDto.builder()
                .id(log.getId())
                .assetId(log.getAsset() != null ? log.getAsset().getId() : null)
                .engineTempCelsius(log.getEngineTempCelsius())
                .vibrationHz(log.getVibrationHz())
                .batteryVoltage(log.getBatteryVoltage())
                .fuelLevelPct(log.getFuelLevelPct())
                .operatingHours(log.getOperatingHours())
                .latitude(log.getLatitude())
                .longitude(log.getLongitude())
                .timestamp(log.getTimestamp())
                .build();
    }
}
