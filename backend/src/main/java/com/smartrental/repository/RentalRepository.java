package com.smartrental.repository;

import com.smartrental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByStatus(String status);
    List<Rental> findByCustomerNameContainingIgnoreCase(String customerName);
    List<Rental> findByAssetId(Long assetId);
}
