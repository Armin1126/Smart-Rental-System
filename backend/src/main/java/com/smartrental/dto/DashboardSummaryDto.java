package com.smartrental.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private long totalAssets;
    private long activeRentals;
    private long activeAlerts;
    private long totalRecommendations;
    private double fleetUtilizationPct;
    private BigDecimal monthlyRevenue;
    private List<AssetDto> activeFleetSample;
}
