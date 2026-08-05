package com.smartrental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryLogDto {
    private Long id;

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    private Double engineTempCelsius;
    private Double vibrationHz;
    private Double batteryVoltage;
    private Double fuelLevelPct;
    private Double operatingHours;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
}
