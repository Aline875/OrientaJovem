package com.orientajovem.demo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class JovemController {


	@GetMapping("/")
	public String inicio() {
		return "Sistema de gestão de RH";
	}
}

