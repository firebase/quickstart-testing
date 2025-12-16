package com.parcelninja.pnjreader.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder, com.parcelninja.pnjreader.config.ParcelninjaApiConfig apiConfig) {
        return builder
                .basicAuthentication(apiConfig.getUsername(), apiConfig.getPassword())
                .build();
    }
}