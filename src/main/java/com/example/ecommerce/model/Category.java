package com.example.ecommerce.model;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Null;

import com.example.ecommerce.validation.constraints.ValidCategoryPatch;
import com.example.ecommerce.validation.constraints.ValidParentCategory;
import com.example.ecommerce.validation.groups.CategoryPatch;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

@Entity
@ValidCategoryPatch(groups = CategoryPatch.class)
public class Category {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Null
	private Long id;
	
	@NotBlank
	private String name;
	
	@ManyToOne
	@ValidParentCategory
	@JsonProperty(access = Access.WRITE_ONLY)
	private Category parent;
	
	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "parent_id")
	@JsonProperty(access = Access.READ_ONLY)
	private List<Category> children;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Category getParent() {
		return parent;
	}

	public void setParent(Category parent) {
		this.parent = parent;
	}

	public List<Category> getChildren() {
		return children;
	}

	public void setChildren(List<Category> children) {
		this.children = children;
	}

}
