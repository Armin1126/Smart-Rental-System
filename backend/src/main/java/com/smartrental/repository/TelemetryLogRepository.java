package com.smartrental.repository;

import com.smartrental.model.TelemetryLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TelemetryLogRepository extends JpaRepository<TelemetryLog, String> {
}
