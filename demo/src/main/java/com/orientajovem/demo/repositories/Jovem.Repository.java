package com.orientajovem.demo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


public interface JovemRepository extends JpaRepository<Jovem, Integer>{

	Optional<Jovem> findById(Int id);

}


