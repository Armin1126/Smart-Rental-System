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

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/{assetId}")
    @Operation(summary = "Get telemetry logs for a specific asset ID")
    public ResponseEntity<List<TelemetryLogDTO>> getTelemetryByAssetId(@PathVariable String assetId) {
        return ResponseEntity.ok(telemetryService.getTelemetryByAssetId(assetId));
    }
}
