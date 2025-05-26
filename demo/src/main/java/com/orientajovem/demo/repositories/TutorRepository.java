package com.orientajovem.demo.repositories;

import java.util.Optional;
import com.orientajovem.demo.entities.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;


public interface TutorRepository extends JpaRepository<Tutor, Integer>{

	Optional<Tutor> findById(Integer id);

}

