package com.example.ecommerce.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.ecommerce.model.Category;
import com.example.ecommerce.repositories.CategoryRepository;
import com.example.ecommerce.validation.constraints.ValidCategoryPatch;

public class CategoryPatchValidator implements ConstraintValidator<ValidCategoryPatch, Category> {

	@Autowired
	CategoryRepository categoryRepository;
	
	@Override
	public boolean isValid(Category value, ConstraintValidatorContext context) {
		// category update must provide a non-blank name or a non-null parent category (or both)
		return value.getId() == null && (!value.getName().isBlank() || value.getParent() != null);
	}

}
