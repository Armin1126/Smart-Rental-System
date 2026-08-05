package com.smartrental.repository;

import com.smartrental.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatorRepository extends JpaRepository<Operator, String> {
}
