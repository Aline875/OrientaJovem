package com.orientajovem.demo.services;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
public class Avaliacao {

	@GetMapping("/avaliacao/busca")
	public String inicio() {
		return "Sistema de gestão de RH";
	}

	@PostMapping("/avaliacao/insere")
	public String inicio() {
		return "Sistema de gestão de RH";
	}
}

