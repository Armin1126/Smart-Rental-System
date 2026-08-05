package com.smartrental.dto;

import java.util.Map;

public class DashboardDTO {
    private long totalAssets;
    private long activeRentals;
    private long overdueRentals;
    private long totalAlerts;
    private long criticalAlerts;
    private long pendingRecommendations;
    private long totalSites;
    private long totalOperators;
    private Map<String, Long> assetsBySite;
    private Map<String, Long> assetsByType;

    public DashboardDTO() {}

    public DashboardDTO(long totalAssets, long activeRentals, long overdueRentals, long totalAlerts, long criticalAlerts, long pendingRecommendations, long totalSites, long totalOperators, Map<String, Long> assetsBySite, Map<String, Long> assetsByType) {
        this.totalAssets = totalAssets;
        this.activeRentals = activeRentals;
        this.overdueRentals = overdueRentals;
        this.totalAlerts = totalAlerts;
        this.criticalAlerts = criticalAlerts;
        this.pendingRecommendations = pendingRecommendations;
        this.totalSites = totalSites;
        this.totalOperators = totalOperators;
        this.assetsBySite = assetsBySite;
        this.assetsByType = assetsByType;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private long totalAssets;
        private long activeRentals;
        private long overdueRentals;
        private long totalAlerts;
        private long criticalAlerts;
        private long pendingRecommendations;
        private long totalSites;
        private long totalOperators;
        private Map<String, Long> assetsBySite;
        private Map<String, Long> assetsByType;

        public Builder totalAssets(long totalAssets) { this.totalAssets = totalAssets; return this; }
        public Builder activeRentals(long activeRentals) { this.activeRentals = activeRentals; return this; }
        public Builder overdueRentals(long overdueRentals) { this.overdueRentals = overdueRentals; return this; }
        public Builder totalAlerts(long totalAlerts) { this.totalAlerts = totalAlerts; return this; }
        public Builder criticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; return this; }
        public Builder pendingRecommendations(long pendingRecommendations) { this.pendingRecommendations = pendingRecommendations; return this; }
        public Builder totalSites(long totalSites) { this.totalSites = totalSites; return this; }
        public Builder totalOperators(long totalOperators) { this.totalOperators = totalOperators; return this; }
        public Builder assetsBySite(Map<String, Long> assetsBySite) { this.assetsBySite = assetsBySite; return this; }
        public Builder assetsByType(Map<String, Long> assetsByType) { this.assetsByType = assetsByType; return this; }

        public DashboardDTO build() {
            return new DashboardDTO(totalAssets, activeRentals, overdueRentals, totalAlerts, criticalAlerts, pendingRecommendations, totalSites, totalOperators, assetsBySite, assetsByType);
        }
    }

    public long getTotalAssets() { return totalAssets; }
    public void setTotalAssets(long totalAssets) { this.totalAssets = totalAssets; }
    public long getActiveRentals() { return activeRentals; }
    public void setActiveRentals(long activeRentals) { this.activeRentals = activeRentals; }
    public long getOverdueRentals() { return overdueRentals; }
    public void setOverdueRentals(long overdueRentals) { this.overdueRentals = overdueRentals; }
    public long getTotalAlerts() { return totalAlerts; }
    public void setTotalAlerts(long totalAlerts) { this.totalAlerts = totalAlerts; }
    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }
    public long getPendingRecommendations() { return pendingRecommendations; }
    public void setPendingRecommendations(long pendingRecommendations) { this.pendingRecommendations = pendingRecommendations; }
    public long getTotalSites() { return totalSites; }
    public void setTotalSites(long totalSites) { this.totalSites = totalSites; }
    public long getTotalOperators() { return totalOperators; }
    public void setTotalOperators(long totalOperators) { this.totalOperators = totalOperators; }
    public Map<String, Long> getAssetsBySite() { return assetsBySite; }
    public void setAssetsBySite(Map<String, Long> assetsBySite) { this.assetsBySite = assetsBySite; }
    public Map<String, Long> getAssetsByType() { return assetsByType; }
    public void setAssetsByType(Map<String, Long> assetsByType) { this.assetsByType = assetsByType; }
}
