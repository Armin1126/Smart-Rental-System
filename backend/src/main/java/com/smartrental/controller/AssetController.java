package com.smartrental.controller;

import com.smartrental.model.Asset;
import com.smartrental.repository.AssetRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@Tag(name = "Asset Management API", description = "CRUD operations for rental equipment assets")
@CrossOrigin(origins = "*")
public class AssetController {

    @Autowired
    private AssetRepository assetRepository;

    @GetMapping
    @Operation(summary = "Get list of all registered assets")
    public ResponseEntity<List<Asset>> getAllAssets() {
        List<Asset> assets = assetRepository.findAll();
        if (assets.isEmpty()) {
            // Provide placeholder sample assets if database is newly initialized
            Asset a1 = Asset.builder()
                    .assetCode("AST-101")
                    .name("CAT 320 Hydraulic Excavator")
                    .category("Heavy Equipment")
                    .status("RENTED")
                    .dailyRate(BigDecimal.valueOf(450.00))
                    .latitude(37.7749)
                    .longitude(-122.4194)
                    .build();
            Asset a2 = Asset.builder()
                    .assetCode("AST-102")
                    .name("Genie S-60 XC Boom Lift")
                    .category("Aerial Lifts")
                    .status("AVAILABLE")
                    .dailyRate(BigDecimal.valueOf(280.00))
                    .latitude(37.7833)
                    .longitude(-122.4167)
                    .build();
            return ResponseEntity.ok(List.of(a1, a2));
        }
        return ResponseEntity.ok(assets);
    }

    @PostMapping
    @Operation(summary = "Register a new rental asset")
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody Asset asset) {
        Asset savedAsset = assetRepository.save(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }
}
