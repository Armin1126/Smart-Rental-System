package com.smartrental.controller;

import com.smartrental.entity.Site;
import com.smartrental.repository.SiteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@Tag(name = "Site Management API", description = "Endpoints for managing rental locations and job sites")

public class SiteController {

    @Autowired
    private SiteRepository siteRepository;

    @GetMapping
    @Operation(summary = "Get list of all sites")
    public ResponseEntity<List<Site>> getAllSites() {
        return ResponseEntity.ok(siteRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Register a new site")
    public ResponseEntity<Site> createSite(@Valid @RequestBody Site site) {
        Site saved = siteRepository.save(site);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
