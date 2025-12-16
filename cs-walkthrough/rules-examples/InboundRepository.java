package com.parcelninja.pnjreader.repository;

import com.parcelninja.pnjreader.model.Inbound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InboundRepository extends JpaRepository<Inbound, Long> {
}