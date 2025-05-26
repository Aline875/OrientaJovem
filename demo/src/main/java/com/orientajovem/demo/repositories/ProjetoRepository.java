package com.orientajovem.demo.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orientajovem.demo.entities.Projeto;

public interface ProjetoRepository extends JpaRepository<Projeto, Integer>{

	Optional<Projeto> findById(Integer id);

}

