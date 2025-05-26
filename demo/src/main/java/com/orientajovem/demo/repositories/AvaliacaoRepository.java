package com.orientajovem.demo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class Avaliacao {


	@GetMapping("/")
	public String inicio() {
		return "Sistema de gestão de RH";
	}
}

