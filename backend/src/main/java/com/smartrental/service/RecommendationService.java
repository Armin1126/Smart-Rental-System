package com.smartrental.service;

import com.smartrental.entity.Recommendation;

import java.util.List;

/**
 * Service interface for Recommendation Engine business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface RecommendationService {
    List<Recommendation> findAll();
    List<Recommendation> findByAssetId(Long assetId);
    Recommendation save(Recommendation recommendation);
}
