package com.parcelninja.pnjreader.service;

import com.parcelninja.pnjreader.config.ParcelninjaApiConfig;
import com.parcelninja.pnjreader.dto.InboundDto;
import com.parcelninja.pnjreader.mapper.InboundMapper;
import com.parcelninja.pnjreader.model.Inbound;
import com.parcelninja.pnjreader.repository.InboundRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParcelninjaApiService {

    private static final Logger logger = LoggerFactory.getLogger(ParcelninjaApiService.class);
    private final RestTemplate restTemplate;
    private final ParcelninjaApiConfig apiConfig;
    private final InboundRepository inboundRepository;
    private final InboundMapper inboundMapper;

    public ParcelninjaApiService(RestTemplate restTemplate, ParcelninjaApiConfig apiConfig, InboundRepository inboundRepository, InboundMapper inboundMapper) {
        this.restTemplate = restTemplate;
        this.apiConfig = apiConfig;
        this.inboundRepository = inboundRepository;
        this.inboundMapper = inboundMapper;
    }

    public List<InboundDto> getInbounds(String fromDate, String toDate) {
        String url = UriComponentsBuilder.fromHttpUrl(apiConfig.getBaseUrl() + "/inbounds")
                .queryParam("fromDate", fromDate)
                .queryParam("toDate", toDate)
                .toUriString();

        logger.info("Fetching inbounds from URL: {}", url);
        try {
            ResponseEntity<List<InboundDto>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<List<InboundDto>>() {});
            return response.getBody();
        } catch (HttpClientErrorException e) {
            logger.error("Error fetching inbounds from Parcelninja API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return Collections.emptyList();
        }
    }

    public void fetchAndSaveInbounds(String fromDate, String toDate) {
        logger.info("Starting to fetch and save inbounds from {} to {}", fromDate, toDate);
        List<InboundDto> inboundDtos = getInbounds(fromDate, toDate);

        if (inboundDtos == null || inboundDtos.isEmpty()) {
            logger.info("No inbounds found for the given date range.");
            return;
        }

        List<Inbound> inboundEntities = inboundDtos.stream().map(inboundMapper::toEntity).collect(Collectors.toList());
        inboundRepository.saveAll(inboundEntities);
        logger.info("Successfully saved {} inbounds to the database.", inboundEntities.size());
    }
}