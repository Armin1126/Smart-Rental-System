package com.smartrental.controller;

import com.smartrental.entity.Telemetry;
import com.smartrental.repository.TelemetryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@Tag(name = "Telemetry API", description = "Endpoints for IoT sensor telemetry data ingestion and retrieval")

public class TelemetryController {

    @Autowired
    private TelemetryRepository telemetryRepository;

    @GetMapping
    @Operation(summary = "Get all telemetry readings")
    public ResponseEntity<List<Telemetry>> getAllTelemetry() {
        return ResponseEntity.ok(telemetryRepository.findAll());
    }

    @GetMapping("/asset/{assetId}")
    @Operation(summary = "Get telemetry readings for a specific asset")
    public ResponseEntity<List<Telemetry>> getTelemetryByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(telemetryRepository.findByAssetId(assetId));
    }

    @PostMapping
    @Operation(summary = "Ingest a new telemetry reading")
    public ResponseEntity<Telemetry> createTelemetry(@Valid @RequestBody Telemetry telemetry) {
        Telemetry saved = telemetryRepository.save(telemetry);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
