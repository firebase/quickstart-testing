package com.parcelninja.pnjreader.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inbounds")
public class Inbound {

    @Id
    private Long id; // Using the ID from the Parcelninja API

    @Column(nullable = false)
    private String clientId;

    private String status;

    private LocalDateTime timeStamp;

    @OneToMany(mappedBy = "inbound", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InboundEvent> events = new ArrayList<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }

    public List<InboundEvent> getEvents() {
        return events;
    }

    public void setEvents(List<InboundEvent> events) {
        this.events = events;
    }
}