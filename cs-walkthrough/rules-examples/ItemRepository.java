package com.example.pnj.repository;

import com.example.pnj.model.Item;
import com.google.cloud.spring.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends FirestoreReactiveRepository<Item> {
}