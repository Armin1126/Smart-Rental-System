package com.smartrental.dto;

public class AssetDTO {
    private String equipmentId;
    private String equipmentType;
    private String make;
    private String model;
    private Integer manufactureYear;
    private String purchaseDate;
    private String currentSite;
    private String status;
    private Double dailyRentalRate;
    private Double currentValue;
    private Integer expectedLifespanYears;
    private Double engineHours;
    private Double idleHours;

    public AssetDTO() {}

    public AssetDTO(String equipmentId, String equipmentType, String make, String model, Integer manufactureYear, String purchaseDate, String currentSite, String status, Double dailyRentalRate, Double currentValue, Integer expectedLifespanYears, Double engineHours, Double idleHours) {
        this.equipmentId = equipmentId;
        this.equipmentType = equipmentType;
        this.make = make;
        this.model = model;
        this.manufactureYear = manufactureYear;
        this.purchaseDate = purchaseDate;
        this.currentSite = currentSite;
        this.status = status;
        this.dailyRentalRate = dailyRentalRate;
        this.currentValue = currentValue;
        this.expectedLifespanYears = expectedLifespanYears;
        this.engineHours = engineHours;
        this.idleHours = idleHours;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String equipmentId;
        private String equipmentType;
        private String make;
        private String model;
        private Integer manufactureYear;
        private String purchaseDate;
        private String currentSite;
        private String status;
        private Double dailyRentalRate;
        private Double currentValue;
        private Integer expectedLifespanYears;
        private Double engineHours;
        private Double idleHours;

        public Builder equipmentId(String equipmentId) { this.equipmentId = equipmentId; return this; }
        public Builder equipmentType(String equipmentType) { this.equipmentType = equipmentType; return this; }
        public Builder make(String make) { this.make = make; return this; }
        public Builder model(String model) { this.model = model; return this; }
        public Builder manufactureYear(Integer manufactureYear) { this.manufactureYear = manufactureYear; return this; }
        public Builder purchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; return this; }
        public Builder currentSite(String currentSite) { this.currentSite = currentSite; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder dailyRentalRate(Double dailyRentalRate) { this.dailyRentalRate = dailyRentalRate; return this; }
        public Builder currentValue(Double currentValue) { this.currentValue = currentValue; return this; }
        public Builder expectedLifespanYears(Integer expectedLifespanYears) { this.expectedLifespanYears = expectedLifespanYears; return this; }
        public Builder engineHours(Double engineHours) { this.engineHours = engineHours; return this; }
        public Builder idleHours(Double idleHours) { this.idleHours = idleHours; return this; }

        public AssetDTO build() {
            return new AssetDTO(equipmentId, equipmentType, make, model, manufactureYear, purchaseDate, currentSite, status, dailyRentalRate, currentValue, expectedLifespanYears, engineHours, idleHours);
        }
    }

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentType() { return equipmentType; }
    public void setEquipmentType(String equipmentType) { this.equipmentType = equipmentType; }
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Integer getManufactureYear() { return manufactureYear; }
    public void setManufactureYear(Integer manufactureYear) { this.manufactureYear = manufactureYear; }
    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getCurrentSite() { return currentSite; }
    public void setCurrentSite(String currentSite) { this.currentSite = currentSite; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getDailyRentalRate() { return dailyRentalRate; }
    public void setDailyRentalRate(Double dailyRentalRate) { this.dailyRentalRate = dailyRentalRate; }
    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }
    public Integer getExpectedLifespanYears() { return expectedLifespanYears; }
    public void setExpectedLifespanYears(Integer expectedLifespanYears) { this.expectedLifespanYears = expectedLifespanYears; }
    public Double getEngineHours() { return engineHours; }
    public void setEngineHours(Double engineHours) { this.engineHours = engineHours; }
    public Double getIdleHours() { return idleHours; }
    public void setIdleHours(Double idleHours) { this.idleHours = idleHours; }
}
