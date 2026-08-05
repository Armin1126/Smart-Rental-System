package com.smartrental.analytics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service client for calling the Python FastAPI Analytics module.
 */
@Service
public class AnalyticsIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsIntegrationService.class);

    public void triggerSyntheticDataPipeline() {
        log.info("Analytics Integration: Invoking Python FastAPI /generate endpoint...");
        // TODO: Use RestTemplate or WebClient to trigger FastAPI ML service during feature development
    }
}
