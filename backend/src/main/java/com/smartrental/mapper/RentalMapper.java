package com.smartrental.mapper;

import com.smartrental.dto.RentalRecordDto;
import com.smartrental.entity.RentalRecord;
import org.springframework.stereotype.Component;

@Component
public class RentalMapper {

    public RentalRecordDto toDto(RentalRecord record) {
        if (record == null) return null;
        return RentalRecordDto.builder()
                .id(record.getId())
                .rentalCode(record.getRentalCode())
                .assetId(record.getAsset() != null ? record.getAsset().getId() : null)
                .operatorId(record.getOperator() != null ? record.getOperator().getId() : null)
                .siteId(record.getSite() != null ? record.getSite().getId() : null)
                .customerName(record.getCustomerName())
                .startDate(record.getStartDate())
                .endDate(record.getEndDate())
                .totalAmount(record.getTotalAmount())
                .status(record.getStatus())
                .build();
    }
}
