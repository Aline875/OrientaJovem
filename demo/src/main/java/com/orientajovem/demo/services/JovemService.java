package com.orientajovem.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.orientajovem.demo.repositories.JovemRepository;
import com.orientajovem.demo.entities.Jovem;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class JovemService {
	
	@Autowired
	private JovemRepository jovemRepository;

	@Autowired
    private BCryptPasswordEncoder encoder;

	public Jovem cadastrarJovem(Jovem jovem) {
	    jovem.setSenha(encoder.encode(jovem.getSenha()));
	    return jovemRepository.save(jovem);
	}
	
	public List<Jovem> listar(){
		return jovemRepository.findAll();
	}
	
	public Jovem buscarJovem(int id) {
		return jovemRepository.findById(id)
		        .orElseThrow(() -> new EntityNotFoundException("Jovem não encontrado para o ID: " + id));
	}

}