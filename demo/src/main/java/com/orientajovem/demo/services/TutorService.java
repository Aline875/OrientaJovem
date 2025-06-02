package com.orientajovem.demo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.orientajovem.demo.repositories.TutorRepository;
import com.orientajovem.demo.entities.Tutor;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class TutorService {
	
	@Autowired
	private TutorRepository tutorRepository;

	@Autowired
    private BCryptPasswordEncoder encoder;

	public Tutor inseriTutor(Tutor tutor) {
	    return tutorRepository.save(tutor);
	}
	
	public List<Tutor> listar(){
		return tutorRepository.findAll();
	}
	
	public Tutor buscarTutor(int id) {
		return tutorRepository.findById(id)
		        .orElseThrow(() -> new EntityNotFoundException("Tutor não encontrado para o ID: " + id));
	}

}

