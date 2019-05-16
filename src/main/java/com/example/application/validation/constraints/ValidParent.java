package com.example.application.validation.constraints;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.example.application.validation.ParentValidator;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=ParentValidator.class)
public @interface ValidParent {
	String message() default "Invalid parent category";
	Class<?>[] groups() default {};
	Class<? extends Payload>[] payload() default {};
}
