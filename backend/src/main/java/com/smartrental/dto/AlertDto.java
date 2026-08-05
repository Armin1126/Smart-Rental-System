package com.smartrental.dto;

public class AlertDTO {
    private Long id;
    private String assetId;
    private String anomalyType;
    private String severity;
    private String description;
    private String timestamp;
    private String recommendedAction;

    public AlertDTO() {}

    public AlertDTO(Long id, String assetId, String anomalyType, String severity, String description, String timestamp, String recommendedAction) {
        this.id = id;
        this.assetId = assetId;
        this.anomalyType = anomalyType;
        this.severity = severity;
        this.description = description;
        this.timestamp = timestamp;
        this.recommendedAction = recommendedAction;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String assetId;
        private String anomalyType;
        private String severity;
        private String description;
        private String timestamp;
        private String recommendedAction;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder assetId(String assetId) { this.assetId = assetId; return this; }
        public Builder anomalyType(String anomalyType) { this.anomalyType = anomalyType; return this; }
        public Builder severity(String severity) { this.severity = severity; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder timestamp(String timestamp) { this.timestamp = timestamp; return this; }
        public Builder recommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; return this; }

        public AlertDTO build() {
            return new AlertDTO(id, assetId, anomalyType, severity, description, timestamp, recommendedAction);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }
    public String getAnomalyType() { return anomalyType; }
    public void setAnomalyType(String anomalyType) { this.anomalyType = anomalyType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
