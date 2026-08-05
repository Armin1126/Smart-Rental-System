package com.smartrental.dto;

public class TelemetryLogDTO {
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

    public TelemetryLogDTO() {}

    public TelemetryLogDTO(String telemetryId, String timestamp, String equipmentId, Double latitude, Double longitude, Double speed, Double operatingHours, Double engineHours, Double idleHours, Double fuelUsedTotal, Double fuelUsedLast24H, Double fuelRemainingPercentage, Double defRemainingPercentage, String engineCondition, Integer loadCount, Double payloadTotal, String diagnosticTroubleCode, String gpsStatus, String ignitionStatus) {
        this.telemetryId = telemetryId;
        this.timestamp = timestamp;
        this.equipmentId = equipmentId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.operatingHours = operatingHours;
        this.engineHours = engineHours;
        this.idleHours = idleHours;
        this.fuelUsedTotal = fuelUsedTotal;
        this.fuelUsedLast24H = fuelUsedLast24H;
        this.fuelRemainingPercentage = fuelRemainingPercentage;
        this.defRemainingPercentage = defRemainingPercentage;
        this.engineCondition = engineCondition;
        this.loadCount = loadCount;
        this.payloadTotal = payloadTotal;
        this.diagnosticTroubleCode = diagnosticTroubleCode;
        this.gpsStatus = gpsStatus;
        this.ignitionStatus = ignitionStatus;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
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

        public Builder telemetryId(String telemetryId) { this.telemetryId = telemetryId; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public Builder equipmentId(String equipmentId) { this.equipmentId = equipmentId; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder speed(Double speed) { this.speed = speed; return this; }
        public Builder operatingHours(Double operatingHours) { this.operatingHours = operatingHours; return this; }
        public Builder engineHours(Double engineHours) { this.engineHours = engineHours; return this; }
        public Builder idleHours(Double idleHours) { this.idleHours = idleHours; return this; }
        public Builder fuelUsedTotal(Double fuelUsedTotal) { this.fuelUsedTotal = fuelUsedTotal; return this; }
        public Builder fuelUsedLast24H(Double fuelUsedLast24H) { this.fuelUsedLast24H = fuelUsedLast24H; return this; }
        public Builder fuelRemainingPercentage(Double fuelRemainingPercentage) { this.fuelRemainingPercentage = fuelRemainingPercentage; return this; }
        public Builder defRemainingPercentage(Double defRemainingPercentage) { this.defRemainingPercentage = defRemainingPercentage; return this; }
        public Builder engineCondition(String engineCondition) { this.engineCondition = engineCondition; return this; }
        public Builder loadCount(Integer loadCount) { this.loadCount = loadCount; return this; }
        public Builder payloadTotal(Double payloadTotal) { this.payloadTotal = payloadTotal; return this; }
        public Builder diagnosticTroubleCode(String diagnosticTroubleCode) { this.diagnosticTroubleCode = diagnosticTroubleCode; return this; }
        public Builder gpsStatus(String gpsStatus) { this.gpsStatus = gpsStatus; return this; }
        public Builder ignitionStatus(String ignitionStatus) { this.ignitionStatus = ignitionStatus; return this; }

        public TelemetryLogDTO build() {
            return new TelemetryLogDTO(telemetryId, timestamp, equipmentId, latitude, longitude, speed, operatingHours, engineHours, idleHours, fuelUsedTotal, fuelUsedLast24H, fuelRemainingPercentage, defRemainingPercentage, engineCondition, loadCount, payloadTotal, diagnosticTroubleCode, gpsStatus, ignitionStatus);
        }
    }

    public String getTelemetryId() { return telemetryId; }
    public void setTelemetryId(String telemetryId) { this.telemetryId = telemetryId; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getSpeed() { return speed; }
    public void setSpeed(Double speed) { this.speed = speed; }
    public Double getOperatingHours() { return operatingHours; }
    public void setOperatingHours(Double operatingHours) { this.operatingHours = operatingHours; }
    public Double getEngineHours() { return engineHours; }
    public void setEngineHours(Double engineHours) { this.engineHours = engineHours; }
    public Double getIdleHours() { return idleHours; }
    public void setIdleHours(Double idleHours) { this.idleHours = idleHours; }
    public Double getFuelUsedTotal() { return fuelUsedTotal; }
    public void setFuelUsedTotal(Double fuelUsedTotal) { this.fuelUsedTotal = fuelUsedTotal; }
    public Double getFuelUsedLast24H() { return fuelUsedLast24H; }
    public void setFuelUsedLast24H(Double fuelUsedLast24H) { this.fuelUsedLast24H = fuelUsedLast24H; }
    public Double getFuelRemainingPercentage() { return fuelRemainingPercentage; }
    public void setFuelRemainingPercentage(Double fuelRemainingPercentage) { this.fuelRemainingPercentage = fuelRemainingPercentage; }
    public Double getDefRemainingPercentage() { return defRemainingPercentage; }
    public void setDefRemainingPercentage(Double defRemainingPercentage) { this.defRemainingPercentage = defRemainingPercentage; }
    public String getEngineCondition() { return engineCondition; }
    public void setEngineCondition(String engineCondition) { this.engineCondition = engineCondition; }
    public Integer getLoadCount() { return loadCount; }
    public void setLoadCount(Integer loadCount) { this.loadCount = loadCount; }
    public Double getPayloadTotal() { return payloadTotal; }
    public void setPayloadTotal(Double payloadTotal) { this.payloadTotal = payloadTotal; }
    public String getDiagnosticTroubleCode() { return diagnosticTroubleCode; }
    public void setDiagnosticTroubleCode(String diagnosticTroubleCode) { this.diagnosticTroubleCode = diagnosticTroubleCode; }
    public String getGpsStatus() { return gpsStatus; }
    public void setGpsStatus(String gpsStatus) { this.gpsStatus = gpsStatus; }
    public String getIgnitionStatus() { return ignitionStatus; }
    public void setIgnitionStatus(String ignitionStatus) { this.ignitionStatus = ignitionStatus; }
}
