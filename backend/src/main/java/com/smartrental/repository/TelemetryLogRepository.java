package com.smartrental.repository;

import com.smartrental.model.TelemetryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TelemetryLogRepository extends JpaRepository<TelemetryLog, String> {
    List<TelemetryLog> findByEquipmentId(String equipmentId);
    List<TelemetryLog> findTop50ByEquipmentIdOrderByTimestampDesc(String equipmentId);
}
