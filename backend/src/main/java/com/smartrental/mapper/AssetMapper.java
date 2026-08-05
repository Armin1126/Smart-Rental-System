package com.smartrental.mapper;

import com.smartrental.dto.AssetDto;
import com.smartrental.entity.Asset;
import org.springframework.stereotype.Component;

/**
 * Mapper utility converting Asset entity to AssetDto and vice versa.
 */
@Component
public class AssetMapper {

    public AssetDto toDto(Asset asset) {
        if (asset == null) return null;
        return AssetDto.builder()
                .id(asset.getId())
                .assetCode(asset.getAssetCode())
                .name(asset.getName())
                .category(asset.getCategory())
                .status(asset.getStatus())
                .dailyRate(asset.getDailyRate())
                .latitude(asset.getLatitude())
                .longitude(asset.getLongitude())
                .siteId(asset.getSite() != null ? asset.getSite().getId() : null)
                .build();
    }

    public Asset toEntity(AssetDto dto) {
        if (dto == null) return null;
        return Asset.builder()
                .id(dto.getId())
                .assetCode(dto.getAssetCode())
                .name(dto.getName())
                .category(dto.getCategory())
                .status(dto.getStatus())
                .dailyRate(dto.getDailyRate())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();
    }
}
