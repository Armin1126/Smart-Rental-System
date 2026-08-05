package com.smartrental.repository;

import com.smartrental.entity.RentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRecordRepository extends JpaRepository<RentalRecord, Long> {
    Optional<RentalRecord> findByRentalCode(String rentalCode);
    List<RentalRecord> findByStatus(String status);
    List<RentalRecord> findByAssetId(Long assetId);
}
