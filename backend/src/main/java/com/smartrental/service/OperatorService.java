package com.smartrental.service;

import com.smartrental.entity.Operator;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for Operator business logic.
 * TODO: Implement in service/impl package during feature development.
 */
public interface OperatorService {
    List<Operator> findAll();
    Optional<Operator> findById(Long id);
    Operator save(Operator operator);
    void deleteById(Long id);
}
