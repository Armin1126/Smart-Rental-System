package com.smartrental.service;

import com.smartrental.entity.Site;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for Site business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface SiteService {
    List<Site> findAll();
    Optional<Site> findById(Long id);
    Site save(Site site);
    void deleteById(Long id);
}
