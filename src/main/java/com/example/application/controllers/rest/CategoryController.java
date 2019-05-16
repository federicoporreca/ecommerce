package com.example.application.controllers.rest;

import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
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

import com.example.application.model.Category;
import com.example.application.repositories.CategoryRepository;
import com.example.application.validation.ParentValidator;

@RestController
@RequestMapping("/categories")
public class CategoryController {
	
	@Autowired
	private CategoryRepository categoryRepository;
	
	@Autowired
	private ParentValidator parentValidator;
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Category createCategory(@Valid @RequestBody Category category) {
		category = categoryRepository.save(category);
		// if parent is not null, retrieve its data
		if (category.getParent() != null) {
			category.setParent(categoryRepository.findById(category.getParent().getId()).get());
		}
		return category;
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Category> getCategory(@PathVariable Long id) {
		Optional<Category> category = categoryRepository.findById(id);
		if (category.isPresent()) {
			return new ResponseEntity<>(category.get(), HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Category> replaceCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
		if (!categoryRepository.existsById(id)) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else if (parentValidator.isDescendantOf(category.getParent(), id)) {
			// prevent setting a category's descendant as its parent (TODO add response body)
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		} else {
			category.setId(id);
			return new ResponseEntity<>(categoryRepository.save(category), HttpStatus.OK);
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Category> deleteCategory(@PathVariable Long id) {
		try {
			categoryRepository.deleteById(id);
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} catch (EmptyResultDataAccessException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

}
