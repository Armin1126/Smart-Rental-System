package com.smartrental.controller;

import com.smartrental.entity.Operator;
import com.smartrental.repository.OperatorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
@Tag(name = "Operator Management API", description = "Endpoints for managing field operators and personnel")

public class OperatorController {

    @Autowired
    private OperatorRepository operatorRepository;

    @GetMapping
    @Operation(summary = "Get list of all operators")
    public ResponseEntity<List<Operator>> getAllOperators() {
        return ResponseEntity.ok(operatorRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Register a new operator")
    public ResponseEntity<Operator> createOperator(@Valid @RequestBody Operator operator) {
        Operator saved = operatorRepository.save(operator);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
