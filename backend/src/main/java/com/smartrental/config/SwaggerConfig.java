package com.smartrental.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI metadata configuration.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI smartRentalOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Rental Asset Tracking API")
                        .description("REST API for managing rental assets, IoT telemetry, sites, operators, and alerts.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Smart Rental Team")
                                .email("team@smartrental.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
