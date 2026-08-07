package com.smartrental.controller;

import com.smartrental.model.Asset;
import com.smartrental.model.RentalRecord;
import com.smartrental.repository.AssetRepository;
import com.smartrental.repository.RentalRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/rentals")
@CrossOrigin(origins = "*")
public class RentalController {

    private final RentalRecordRepository rentalRecordRepository;
    private final AssetRepository assetRepository;

    public RentalController(RentalRecordRepository rentalRecordRepository, AssetRepository assetRepository) {
        this.rentalRecordRepository = rentalRecordRepository;
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<List<RentalRecord>> getAllRentals(
            @RequestParam(required = false) String customerCode,
            @RequestParam(required = false) String customerName) {
        
        List<RentalRecord> all = rentalRecordRepository.findAll();
        
        if (customerCode != null && !customerCode.trim().isEmpty()) {
            List<RentalRecord> filtered = all.stream()
                    .filter(r -> customerCode.equalsIgnoreCase(r.getCustomerCode()))
                    .toList();
            if (!filtered.isEmpty()) {
                return ResponseEntity.ok(filtered);
            }
        }

        if (customerName != null && !customerName.trim().isEmpty()) {
            String lowerName = customerName.trim().toLowerCase();
            List<RentalRecord> filtered = all.stream()
                    .filter(r -> r.getCustomerName() != null && r.getCustomerName().toLowerCase().contains(lowerName))
                    .toList();
            if (!filtered.isEmpty()) {
                return ResponseEntity.ok(filtered);
            }
        }

        return ResponseEntity.ok(all);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutEquipment(@RequestBody Map<String, Object> body) {
        try {
            String eqId = (String) body.get("equipmentId");
            String siteId = (String) body.get("siteId");
            String operatorId = (String) body.get("operatorId");
            String customerCode = (String) body.get("customerCode");
            String customerName = (String) body.get("customerName");
            String returnDate = (String) body.get("returnDate");

            Optional<Asset> assetOpt = assetRepository.findById(eqId);
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                asset.setStatus("IN_USE");
                if (siteId != null && !siteId.trim().isEmpty()) asset.setCurrentSite(siteId);
                assetRepository.save(asset);
            }

            String rentalId = "RNT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            RentalRecord record = RentalRecord.builder()
                    .rentalId(rentalId)
                    .equipmentId(eqId)
                    .siteId(siteId)
                    .lastOperatorId(operatorId)
                    .customerCode(customerCode != null ? customerCode : "CUST001")
                    .customerName(customerName != null ? customerName : "Acme Construction Co.")
                    .checkOutDate(LocalDate.now().toString())
                    .originalReturnDate(returnDate != null ? returnDate : LocalDate.now().plusDays(30).toString())
                    .rentalStatus("ACTIVE")
                    .isExtended(false)
                    .build();
            rentalRecordRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Asset " + eqId + " successfully checked out.",
                    "rentalId", rentalId,
                    "assetStatus", "IN_USE"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkinEquipment(@RequestBody Map<String, Object> body) {
        try {
            String eqId = (String) body.get("equipmentId");
            String siteId = (String) body.get("siteId");
            Double engineHours = body.get("engineHours") != null ? Double.parseDouble(body.get("engineHours").toString()) : null;

            Optional<Asset> assetOpt = assetRepository.findById(eqId);
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                asset.setStatus("AVAILABLE");
                if (siteId != null && !siteId.trim().isEmpty()) asset.setCurrentSite(siteId);
                if (engineHours != null) asset.setEngineHours(engineHours);
                assetRepository.save(asset);
            }

            List<RentalRecord> rentals = rentalRecordRepository.findByEquipmentId(eqId);
            for (RentalRecord r : rentals) {
                if ("ACTIVE".equalsIgnoreCase(r.getRentalStatus())) {
                    r.setRentalStatus("RETURNED");
                    r.setActualReturnDate(LocalDate.now().toString());
                    rentalRecordRepository.save(r);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Asset " + eqId + " successfully checked in and updated to AVAILABLE in Catalog.",
                    "assetStatus", "AVAILABLE"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

