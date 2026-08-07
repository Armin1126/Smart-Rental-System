package com.smartrental.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrental.model.RentalRecord;
import com.smartrental.repository.AssetRepository;
import com.smartrental.repository.RentalRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "*")
public class ForecastController {

    @Value("${app.datasets-dir:../datasets}")
    private String datasetsDir;

    private final RentalRecordRepository rentalRepository;
    private final AssetRepository assetRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ForecastController(RentalRecordRepository rentalRepository, AssetRepository assetRepository) {
        this.rentalRepository = rentalRepository;
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<?> getDemandForecast() {
        try {
            List<RentalRecord> rentals = rentalRepository.findAll();
            
            if (rentals != null && !rentals.isEmpty()) {
                Map<String, Map<String, Integer>> siteTypeDemand = new LinkedHashMap<>();

                for (RentalRecord r : rentals) {
                    String site = r.getSiteId() != null ? r.getSiteId() : "S001";
                    String type = r.getType() != null ? r.getType() : "Machinery";

                    siteTypeDemand.computeIfAbsent(site, k -> new LinkedHashMap<>());
                    Map<String, Integer> typeMap = siteTypeDemand.get(site);
                    typeMap.put(type, typeMap.getOrDefault(type, 0) + 1);
                }

                List<Map<String, Object>> forecastList = new ArrayList<>();
                siteTypeDemand.forEach((site, typeMap) -> {
                    typeMap.forEach((type, count) -> {
                        int predictedRentals = Math.max(1, (int) Math.round(count / 3.0));
                        double confidenceScore = Math.min(96.5, Math.max(78.0, 80.0 + (count * 1.5)));
                        confidenceScore = Math.round(confidenceScore * 10.0) / 10.0;

                        Map<String, Object> item = new HashMap<>();
                        item.put("Site_ID", site);
                        item.put("Site", site);
                        item.put("Equipment_Type", type);
                        item.put("Type", type);
                        item.put("Forecast_Month", "2026-09");
                        item.put("Predicted_Rentals", predictedRentals);
                        item.put("Confidence_Score", confidenceScore);
                        item.put("Historical_Contracts", count);
                        forecastList.add(item);
                    });
                });

                forecastList.sort((a, b) -> Integer.compare((Integer) b.get("Predicted_Rentals"), (Integer) a.get("Predicted_Rentals")));

                return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "forecast_target_month", "2026-09",
                    "total_predictions", forecastList.size(),
                    "forecasts", forecastList
                ));
            }

            // Fallback to forecast.json dataset if PostgreSQL is empty
            Path path = Paths.get(datasetsDir, "forecast.json");
            File file = path.toFile();
            if (file.exists()) {
                Map<?, ?> json = objectMapper.readValue(file, Map.class);
                return ResponseEntity.ok(json);
            }

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "forecast_target_month", "2026-09",
                "total_predictions", 0,
                "forecasts", List.of()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
