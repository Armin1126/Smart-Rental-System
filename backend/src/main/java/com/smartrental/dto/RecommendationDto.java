package com.smartrental.dto;

public class RecommendationDTO {
    private Long id;
    private String equipmentId;
    private String equipmentType;
    private String currentSite;
    private String action;
    private String priority;
    private String justification;

    public RecommendationDTO() {}

    public RecommendationDTO(Long id, String equipmentId, String equipmentType, String currentSite, String action, String priority, String justification) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.equipmentType = equipmentType;
        this.currentSite = currentSite;
        this.action = action;
        this.priority = priority;
        this.justification = justification;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String equipmentId;
        private String equipmentType;
        private String currentSite;
        private String action;
        private String priority;
        private String justification;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder equipmentId(String equipmentId) { this.equipmentId = equipmentId; return this; }
        public Builder equipmentType(String equipmentType) { this.equipmentType = equipmentType; return this; }
        public Builder currentSite(String currentSite) { this.currentSite = currentSite; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder priority(String priority) { this.priority = priority; return this; }
        public Builder justification(String justification) { this.justification = justification; return this; }

        public RecommendationDTO build() {
            return new RecommendationDTO(id, equipmentId, equipmentType, currentSite, action, priority, justification);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentType() { return equipmentType; }
    public void setEquipmentType(String equipmentType) { this.equipmentType = equipmentType; }
    public String getCurrentSite() { return currentSite; }
    public void setCurrentSite(String currentSite) { this.currentSite = currentSite; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
}
