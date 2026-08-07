package com.smartrental.controller;

import com.smartrental.dto.TelemetryLogDTO;
import com.smartrental.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@Tag(name = "Telemetry API", description = "Operations for retrieving asset telemetry logs")
@CrossOrigin(origins = "*")
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final com.smartrental.service.TelemetrySimulatorService simulatorService;

    public TelemetryController(TelemetryService telemetryService,
                               com.smartrental.service.TelemetrySimulatorService simulatorService) {
        this.telemetryService = telemetryService;
        this.simulatorService = simulatorService;
    }

    @GetMapping("/{assetId}")
    @Operation(summary = "Get telemetry logs for a specific asset ID")
    public ResponseEntity<List<TelemetryLogDTO>> getTelemetryByAssetId(@PathVariable String assetId) {
        return ResponseEntity.ok(telemetryService.getTelemetryByAssetId(assetId));
    }

    @PostMapping("/simulate")
    @Operation(summary = "Trigger a 5-second telemetry simulation cycle manually")
    public ResponseEntity<String> triggerSimulation() {
        simulatorService.runTelemetrySimulationCycle();
        return ResponseEntity.ok("Telemetry simulation cycle triggered successfully.");
    }
}
