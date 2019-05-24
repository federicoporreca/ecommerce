package com.example.ecommerce.controllers.rest;

import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommerce.model.Category;
import com.example.ecommerce.repositories.CategoryRepository;
import com.example.ecommerce.validation.ParentCategoryValidator;
import com.example.ecommerce.validation.groups.CategoryPatch;

@RestController
@RequestMapping("/categories")
public class CategoryController {
	
	@Autowired
	private CategoryRepository categoryRepository;
	
	@Autowired
	private ParentCategoryValidator parentValidator;
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Category createCategory(@Valid @RequestBody Category category) {
		return categoryRepository.save(category);
	}
	
	@GetMapping
	public Iterable<Category> getCategories() {
		return categoryRepository.findByParentIsNull();
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
		}
		if (parentValidator.isDescendantOf(category.getParent(), id)) {
			// prevent setting a category's descendant as its parent (TODO add response body)
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		category.setId(id);
		return new ResponseEntity<>(categoryRepository.save(category), HttpStatus.OK);
	}
	
	@PatchMapping("/{id}")
	public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Validated(CategoryPatch.class) @RequestBody Category category) {
		Optional<Category> oldCategory = categoryRepository.findById(id);
		if (oldCategory.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		if (category.getParent() != null && parentValidator.isDescendantOf(category.getParent(), id)) {
			// prevent setting a category's descendant as its parent (TODO add response body)
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		if (!category.getName().isBlank()) {
			oldCategory.get().setName(category.getName());
		}
		oldCategory.get().setParent(categoryRepository.findById(category.getParent().getId()).get());;
		return new ResponseEntity<>(categoryRepository.save(oldCategory.get()), HttpStatus.OK);
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
