package com.smartrental.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "telemetry_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryLog {

    @Id
    private String telemetryId;
    
    private String timestamp;
    private String equipmentId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double operatingHours;
    private Double engineHours;
    private Double idleHours;
    private Double fuelUsedTotal;
    private Double fuelUsedLast24H;
    private Double fuelRemainingPercentage;
    private Double defRemainingPercentage;
    private String engineCondition;
    private Integer loadCount;
    private Double payloadTotal;
    private String diagnosticTroubleCode;
    private String gpsStatus;
    private String ignitionStatus;

}
