package com.smartrental.service;

import com.smartrental.dto.AlertDTO;
import com.smartrental.model.Alert;
import com.smartrental.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public List<AlertDTO> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AlertDTO mapToDTO(Alert a) {
        return AlertDTO.builder()
                .id(a.getId())
                .assetId(a.getAssetId())
                .anomalyType(a.getAnomalyType())
                .severity(a.getSeverity())
                .description(a.getDescription())
                .timestamp(a.getTimestamp())
                .recommendedAction(a.getRecommendedAction())
                .build();
    }
}
