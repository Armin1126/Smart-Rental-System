package com.smartrental.controller;

import com.smartrental.dto.AlertDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts API", description = "Under-utilization, vibration anomaly & geofence alerts endpoint")
public class AlertController {

    @GetMapping
    @Operation(summary = "Get list of active equipment alerts")
    public ResponseEntity<List<AlertDto>> getAlerts() {
        AlertDto a1 = AlertDto.builder()
                .id(1L)
                .assetId(1L)
                .alertType("VIBRATION_ANOMALY")
                .severity("HIGH")
                .message("Engine vibration exceeded 65Hz threshold on Excavator AST-101")
                .acknowledged(false)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        AlertDto a2 = AlertDto.builder()
                .id(2L)
                .assetId(4L)
                .alertType("GEOFENCE_BREACH")
                .severity("CRITICAL")
                .message("Asset moved outside assigned Job Site #3 boundary")
                .acknowledged(false)
                .createdAt(LocalDateTime.now().minusMinutes(45))
                .build();

        return ResponseEntity.ok(List.of(a1, a2));
    }
}
