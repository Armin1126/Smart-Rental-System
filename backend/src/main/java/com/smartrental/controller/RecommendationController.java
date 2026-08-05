package com.smartrental.controller;

import com.smartrental.dto.RecommendationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "Recommendation Engine API", description = "AI-driven demand forecasting and reallocation recommendations")
public class RecommendationController {

    @GetMapping
    @Operation(summary = "Get list of predictive equipment recommendations")
    public ResponseEntity<List<RecommendationDto>> getRecommendations() {
        RecommendationDto r1 = RecommendationDto.builder()
                .id(1L)
                .assetId(2L)
                .recommendationType("REALLOCATION")
                .title("Reallocate Boom Lift to Site #3")
                .description("Site #3 exhibits 40% higher aerial demand over the next 14 days.")
                .confidenceScore(0.88)
                .impactScore("HIGH")
                .createdAt(LocalDateTime.now())
                .build();

        RecommendationDto r2 = RecommendationDto.builder()
                .id(2L)
                .assetId(5L)
                .recommendationType("PRICING_DISCOUNT")
                .title("Promotional 15% Daily Rate Discount")
                .description("Roller under-utilization detected (<15h/week). Discount will boost rental probability.")
                .confidenceScore(0.76)
                .impactScore("MEDIUM")
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(List.of(r1, r2));
    }
}
