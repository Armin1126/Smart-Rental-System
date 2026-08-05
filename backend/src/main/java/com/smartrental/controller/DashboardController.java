package com.smartrental.controller;

import com.smartrental.dto.AssetDto;
import com.smartrental.dto.DashboardSummaryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard API", description = "Operational metrics summary endpoint")
public class DashboardController {

    @GetMapping
    @Operation(summary = "Get aggregated operational dashboard summary metrics")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        AssetDto sample1 = AssetDto.builder()
                .id(1L)
                .assetCode("AST-101")
                .name("CAT 320 Hydraulic Excavator")
                .category("Earthmoving")
                .status("RENTED")
                .dailyRate(BigDecimal.valueOf(450.00))
                .latitude(37.7749)
                .longitude(-122.4194)
                .build();

        DashboardSummaryDto summary = DashboardSummaryDto.builder()
                .totalAssets(142)
                .activeRentals(98)
                .activeAlerts(3)
                .totalRecommendations(2)
                .fleetUtilizationPct(89.5)
                .monthlyRevenue(BigDecimal.valueOf(48250.00))
                .activeFleetSample(List.of(sample1))
                .build();

        return ResponseEntity.ok(summary);
    }
}
