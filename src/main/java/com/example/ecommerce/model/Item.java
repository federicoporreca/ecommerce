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
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import com.example.ecommerce.validation.constraints.ValidCategory;

import lombok.Data;

@Data
@Entity
public class Item {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Null
	private Long id;
	
	@ManyToOne(cascade = CascadeType.ALL)
	@NotNull
	@Valid
	private Brand brand;
	
	@NotBlank
	private String name;
	
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "item_id")
	@NotEmpty
	@Valid
	private List<Price> prices;
	
	@NotNull // TODO replace with pattern
	private String ean;
	
	@NotNull // TODO replace with pattern or custom constraint
	private String imageUrl;
	
	@ManyToOne
	@ValidCategory
	private Category category;
	
}
