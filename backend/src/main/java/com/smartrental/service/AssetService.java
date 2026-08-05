package com.smartrental.service;

import com.smartrental.dto.AssetDTO;
import com.smartrental.model.Asset;
import com.smartrental.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    public List<AssetDTO> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AssetDTO mapToDTO(Asset a) {
        return AssetDTO.builder()
                .equipmentId(a.getEquipmentId())
                .equipmentType(a.getEquipmentType())
                .make(a.getMake())
                .model(a.getModel())
                .manufactureYear(a.getManufactureYear())
                .purchaseDate(a.getPurchaseDate())
                .currentSite(a.getCurrentSite())
                .status(a.getStatus())
                .dailyRentalRate(a.getDailyRentalRate())
                .currentValue(a.getCurrentValue())
                .expectedLifespanYears(a.getExpectedLifespanYears())
                .engineHours(a.getEngineHours())
                .idleHours(a.getIdleHours())
                .build();
    }
}
