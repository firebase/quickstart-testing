package com.example.pnj.service;

import com.example.pnj.model.Item;
import com.example.pnj.repository.ItemRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(CsvProcessingService.class);
    private final ItemRepository itemRepository;

    public CsvProcessingService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public void processAndSaveItems(InputStream inputStream) throws CsvValidationException, IOException {
        List<Item> items = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(inputStream))) {
            // Skip header row
            reader.readNext();

            String[] line;
            while ((line = reader.readNext()) != null) {
                // Assuming CSV format: name,description,price
                Item item = new Item(line[0], line[1], Double.parseDouble(line[2]));
                items.add(item);
            }
        } catch (IOException | CsvValidationException | NumberFormatException e) {
            logger.error("Error processing CSV file", e);
            throw e;
        }
        itemRepository.saveAll(items);
    }
}