package com.parcelninja.pnjreader.mapper;

import com.parcelninja.pnjreader.dto.InboundDto;
import com.parcelninja.pnjreader.model.Inbound;
import com.parcelninja.pnjreader.model.InboundEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Component
public class InboundMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public Inbound toEntity(InboundDto dto) {
        if (dto == null) {
            return null;
        }

        Inbound entity = new Inbound();
        entity.setId(dto.getId());
        entity.setClientId(dto.getClientId());
        entity.setStatus(dto.getStatus());
        entity.setTimeStamp(parseDateTime(dto.getTimeStamp()));

        if (dto.getEvents() != null) {
            entity.setEvents(dto.getEvents().stream()
                    .map(eventDto -> toEventEntity(eventDto, entity))
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    private InboundEvent toEventEntity(InboundDto.Event eventDto, Inbound parent) {
        InboundEvent eventEntity = new InboundEvent();
        eventEntity.setCode(eventDto.getCode());
        eventEntity.setDescription(eventDto.getDescription());
        eventEntity.setTimeStamp(parseDateTime(eventDto.getTimeStamp()));
        eventEntity.setInbound(parent); // Set the back-reference
        return eventEntity;
    }

    private LocalDateTime parseDateTime(String dateTimeString) {
        return dateTimeString != null ? LocalDateTime.parse(dateTimeString, FORMATTER) : null;
    }
}