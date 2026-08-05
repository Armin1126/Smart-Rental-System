package com.smartrental.controller;

import com.smartrental.entity.Alert;
import com.smartrental.repository.AlertRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alert Management API", description = "Endpoints for maintenance alerts and anomaly notifications")

public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    @Operation(summary = "Get all alerts")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }

    @GetMapping("/unacknowledged")
    @Operation(summary = "Get unacknowledged alerts")
    public ResponseEntity<List<Alert>> getUnacknowledgedAlerts() {
        return ResponseEntity.ok(alertRepository.findByAcknowledged(false));
    }

    @PostMapping
    @Operation(summary = "Create a new alert")
    public ResponseEntity<Alert> createAlert(@Valid @RequestBody Alert alert) {
        Alert saved = alertRepository.save(alert);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
