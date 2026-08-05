package com.smartrental.repository;

import com.smartrental.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByAssetId(Long assetId);
    List<Alert> findBySeverity(String severity);
    List<Alert> findByAcknowledged(Boolean acknowledged);
}
