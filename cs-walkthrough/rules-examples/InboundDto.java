package com.parcelninja.pnjreader.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class InboundDto {

    @JsonProperty("id")
    private long id;

    @JsonProperty("clientId")
    private String clientId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("timeStamp")
    private String timeStamp;

    @JsonProperty("events")
    private List<Event> events;

    // Getters and setters...

    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

    public String getClientId() { return clientId; }

    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public String getTimeStamp() { return timeStamp; }

    public void setTimeStamp(String timeStamp) { this.timeStamp = timeStamp; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Event {
        @JsonProperty("code")
        private int code;

        @JsonProperty("description")
        private String description;

        @JsonProperty("timeStamp")
        private String timeStamp;

        // Getters and setters...
        public int getCode() { return code; }

        public void setCode(int code) { this.code = code; }

        public String getDescription() { return description; }

        public void setDescription(String description) { this.description = description; }

        public String getTimeStamp() { return timeStamp; }

        public void setTimeStamp(String timeStamp) { this.timeStamp = timeStamp; }
    }
}