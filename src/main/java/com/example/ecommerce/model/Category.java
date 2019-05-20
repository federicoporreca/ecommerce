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

import com.example.ecommerce.validation.constraints.ValidParent;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import lombok.Data;

@Data
@Entity
public class Category {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Null
	private Long id;
	
	@NotBlank
	private String name;
	
	@ManyToOne
	@ValidParent
	@JsonProperty(access = Access.WRITE_ONLY)
	private Category parent;
	
	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "parent_id")
	@JsonProperty(access = Access.READ_ONLY)
	private List<Category> children;

	@Override
	public String toString() {
		return "Category [id=" + id + ", name=" + name + ", children=" + children + "]";
	}

}
