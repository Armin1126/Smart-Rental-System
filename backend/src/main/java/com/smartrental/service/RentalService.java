package com.smartrental.service;

import com.smartrental.entity.Rental;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for Rental business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface RentalService {
    List<Rental> findAll();
    Optional<Rental> findById(Long id);
    Rental save(Rental rental);
    void deleteById(Long id);
}
