package com.example.application.repositories;

import org.springframework.data.repository.CrudRepository;

import com.example.application.model.Item;

public interface ItemRepository extends CrudRepository<Item, Long> {

}
