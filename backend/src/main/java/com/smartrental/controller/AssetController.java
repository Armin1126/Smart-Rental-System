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
        return ResponseEntity.ok(assetRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Register a new rental asset")
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody Asset asset) {
        Asset savedAsset = assetRepository.save(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAsset);
    }
}
