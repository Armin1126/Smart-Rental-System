package com.smartrental.repository;

import com.smartrental.entity.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {
    Optional<Operator> findByOperatorCode(String operatorCode);
    List<Operator> findByStatus(String status);
    List<Operator> findByAssignedSiteId(Long siteId);
}
