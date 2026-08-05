package com.smartrental.repository;

import com.smartrental.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByAssetCode(String assetCode);
    List<Asset> findByStatus(String status);
    List<Asset> findBySiteId(Long siteId);
}
