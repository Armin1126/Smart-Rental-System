package com.smartrental.service;

import com.smartrental.dto.DashboardDTO;
import com.smartrental.model.Alert;
import com.smartrental.model.Asset;
import com.smartrental.model.RentalRecord;
import com.smartrental.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AssetRepository assetRepository;
    private final SiteRepository siteRepository;
    private final OperatorRepository operatorRepository;
    private final RentalRecordRepository rentalRecordRepository;
    private final AlertRepository alertRepository;
    private final RecommendationRepository recommendationRepository;

    public DashboardService(
            AssetRepository assetRepository,
            SiteRepository siteRepository,
            OperatorRepository operatorRepository,
            RentalRecordRepository rentalRecordRepository,
            AlertRepository alertRepository,
            RecommendationRepository recommendationRepository) {
        this.assetRepository = assetRepository;
        this.siteRepository = siteRepository;
        this.operatorRepository = operatorRepository;
        this.rentalRecordRepository = rentalRecordRepository;
        this.alertRepository = alertRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public DashboardDTO getDashboardMetrics() {
        List<Asset> assets = assetRepository.findAll();
        List<RentalRecord> rentals = rentalRecordRepository.findAll();
        List<Alert> alerts = alertRepository.findAll();

        long activeRentals = rentals.stream()
                .filter(r -> "ACTIVE".equalsIgnoreCase(r.getRentalStatus()) || "EXTENDED".equalsIgnoreCase(r.getRentalStatus()))
                .count();

        long overdueRentals = rentals.stream()
                .filter(r -> "OVERDUE".equalsIgnoreCase(r.getRentalStatus()))
                .count();

        long criticalAlerts = alerts.stream()
                .filter(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity()))
                .count();

        Map<String, Long> assetsBySite = assets.stream()
                .filter(a -> a.getCurrentSite() != null)
                .collect(Collectors.groupingBy(Asset::getCurrentSite, Collectors.counting()));

        Map<String, Long> assetsByType = assets.stream()
                .filter(a -> a.getEquipmentType() != null)
                .collect(Collectors.groupingBy(Asset::getEquipmentType, Collectors.counting()));

        return DashboardDTO.builder()
                .totalAssets(assetRepository.count())
                .activeRentals(activeRentals)
                .overdueRentals(overdueRentals)
                .totalAlerts(alertRepository.count())
                .criticalAlerts(criticalAlerts)
                .pendingRecommendations(recommendationRepository.count())
                .totalSites(siteRepository.count())
                .totalOperators(operatorRepository.count())
                .assetsBySite(assetsBySite)
                .assetsByType(assetsByType)
                .build();
    }
}
