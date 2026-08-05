package com.smartrental.service;

import com.smartrental.entity.Telemetry;

import java.util.List;

/**
 * Service interface for Telemetry business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface TelemetryService {
    List<Telemetry> findAll();
    List<Telemetry> findByAssetId(Long assetId);
    Telemetry save(Telemetry telemetry);
}
