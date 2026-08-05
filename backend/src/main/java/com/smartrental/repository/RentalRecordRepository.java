package com.smartrental.repository;

import com.smartrental.model.RentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalRecordRepository extends JpaRepository<RentalRecord, String> {
}
