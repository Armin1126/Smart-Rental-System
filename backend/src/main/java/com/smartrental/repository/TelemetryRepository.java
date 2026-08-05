package com.smartrental.repository;

import com.smartrental.entity.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    List<Telemetry> findByAssetId(Long assetId);
    List<Telemetry> findByAssetIdAndTimestampBetween(Long assetId, LocalDateTime start, LocalDateTime end);
}
