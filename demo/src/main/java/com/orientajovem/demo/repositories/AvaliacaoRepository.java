package com.orientajovem.demo.repositories;

import java.util.Optional;
import com.orientajovem.demo.entities.Avaliacao;

import org.springframework.data.jpa.repository.JpaRepository;


public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer>{

	Optional<Avaliacao> findById(Integer id);

}

