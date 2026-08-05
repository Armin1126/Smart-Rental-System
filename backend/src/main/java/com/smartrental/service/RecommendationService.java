package com.smartrental.service;

import com.smartrental.dto.RecommendationDTO;
import com.smartrental.model.Recommendation;
import com.smartrental.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;

    public RecommendationService(RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
    }

    public List<RecommendationDTO> getAllRecommendations() {
        return recommendationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private RecommendationDTO mapToDTO(Recommendation r) {
        return RecommendationDTO.builder()
                .id(r.getId())
                .equipmentId(r.getEquipmentId())
                .equipmentType(r.getEquipmentType())
                .currentSite(r.getCurrentSite())
                .action(r.getAction())
                .priority(r.getPriority())
                .justification(r.getJustification())
                .build();
    }
}
