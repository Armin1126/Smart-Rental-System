package com.smartrental.repository;

import com.smartrental.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByStatus(String status);
    List<Rental> findByCustomerNameContainingIgnoreCase(String customerName);
}
