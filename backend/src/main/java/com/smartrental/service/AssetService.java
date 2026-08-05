package com.smartrental.service;

import com.smartrental.entity.Asset;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for Asset business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface AssetService {
    List<Asset> findAll();
    Optional<Asset> findById(Long id);
    Asset save(Asset asset);
    void deleteById(Long id);
}
