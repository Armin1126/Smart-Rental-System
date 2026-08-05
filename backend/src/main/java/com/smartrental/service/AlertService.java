package com.smartrental.service;

import com.smartrental.entity.Alert;

import java.util.List;

/**
 * Service interface for Alert business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface AlertService {
    List<Alert> findAll();
    List<Alert> findByAssetId(Long assetId);
    List<Alert> findUnacknowledged();
    Alert save(Alert alert);
}
