package com.smartrental.repository;

import com.smartrental.model.RentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalRecordRepository extends JpaRepository<RentalRecord, String> {
    List<RentalRecord> findByCustomerCode(String customerCode);
    List<RentalRecord> findByEquipmentId(String equipmentId);
}
