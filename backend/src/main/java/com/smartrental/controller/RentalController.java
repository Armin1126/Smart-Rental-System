package com.smartrental.controller;

import com.smartrental.entity.Rental;
import com.smartrental.repository.RentalRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@Tag(name = "Rental Contracts API", description = "Endpoints for managing rental contracts and lifecycle")

public class RentalController {

    @Autowired
    private RentalRepository rentalRepository;

    @GetMapping
    @Operation(summary = "Get list of all rental agreements")
    public ResponseEntity<List<Rental>> getAllRentals() {
        return ResponseEntity.ok(rentalRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Create a new rental contract")
    public ResponseEntity<Rental> createRental(@Valid @RequestBody Rental rental) {
        Rental saved = rentalRepository.save(rental);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
