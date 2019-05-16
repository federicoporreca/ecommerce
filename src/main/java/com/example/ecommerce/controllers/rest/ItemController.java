package com.example.ecommerce.controllers.rest;

import java.util.List;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.model.Brand;
import com.example.ecommerce.model.Item;
import com.example.ecommerce.repositories.BrandRepository;
import com.example.ecommerce.repositories.CategoryRepository;
import com.example.ecommerce.repositories.ItemRepository;

@RestController
@RequestMapping("/items")
public class ItemController {
	
	@Autowired
	private ItemRepository itemRepository;
	
	@Autowired
	private BrandRepository brandRepository;
	
	@Autowired
	private CategoryRepository categoryRepository;
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Item createItem(@Valid @RequestBody Item item) {
		// if brand already exists, set item brand to the existing one
		List<Brand> brands = brandRepository.findByName(item.getBrand().getName());
		if (!brands.isEmpty()) {
			item.setBrand(brands.get(0)); // list is either empty or contains a single element
		}
		// retrieve category data
		item.setCategory(categoryRepository.findById(item.getCategory().getId()).get());
		return itemRepository.save(item);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Item> getItem(@PathVariable Long id) {
		Optional<Item> optionalItem = itemRepository.findById(id);
		if (optionalItem.isPresent()) {
			return new ResponseEntity<>(optionalItem.get(), HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Item> replaceItem(@PathVariable Long id, @Valid @RequestBody Item item) {
		if (!itemRepository.existsById(id)) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			// if brand already exists, set item brand to the existing one
			List<Brand> brands = brandRepository.findByName(item.getBrand().getName());
			if (!brands.isEmpty()) {
				item.setBrand(brands.get(0)); // list is either empty or contains a single element
			}
			item.setId(id);
			return new ResponseEntity<>(itemRepository.save(item), HttpStatus.OK);
		}
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(code=HttpStatus.NO_CONTENT)
	public void deleteItem(@PathVariable Long id) {
		itemRepository.deleteById(id);
	}
	
}
