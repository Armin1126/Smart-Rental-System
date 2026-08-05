package com.smartrental.controller;

import com.smartrental.dto.TelemetryLogDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@Tag(name = "Telemetry API", description = "Endpoints for IoT sensor telemetry data ingestion")
public class TelemetryController {

    @PostMapping
    @Operation(summary = "Ingest live IoT telemetry reading log")
    public ResponseEntity<TelemetryLogDto> ingestTelemetry(@Valid @RequestBody TelemetryLogDto dto) {
        if (dto.getTimestamp() == null) {
            dto.setTimestamp(LocalDateTime.now());
        }
        dto.setId(1001L);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
