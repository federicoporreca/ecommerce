package com.example.application.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.application.model.Category;
import com.example.application.repositories.CategoryRepository;
import com.example.application.validation.constraints.ValidParent;

@Component
public class ParentValidator implements ConstraintValidator<ValidParent, Category> {
	
	@Autowired
	CategoryRepository categoryRepository;

	@Override
	public boolean isValid(Category value, ConstraintValidatorContext context) {
		// parent is valid if null or its id corresponds to an existing category (other fields are ignored if cascade is not set)
		return value == null || (value.getId() != null && categoryRepository.existsById(value.getId()));
	}

	// checks if category is a descendant of the category with the given id
	public boolean isDescendantOf(Category category, Long id) {
		if (category == null) {
			return false;
		}
		Category suspect = categoryRepository.findById(category.getId()).get();
		while (suspect != null) {
			if (suspect.getId() == id) {
				return true;
			}
			suspect = suspect.getParent();
		}
		return false;
	}

}
