package com.laptoptracker.service;

import com.laptoptracker.dto.LaptopDTO;
import com.laptoptracker.entity.Laptop;
import com.laptoptracker.enums.LaptopStatus;
import com.laptoptracker.exception.BadRequestException;
import com.laptoptracker.repository.LaptopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Laptop management operations
 */
@Service
public class LaptopService {

    @Autowired
    private LaptopRepository laptopRepository;

    /**
     * Add a new laptop to inventory
     */
    @Transactional
    public Laptop addLaptop(LaptopDTO laptopDTO) {
        // Check if serial number already exists
        if (laptopRepository.existsBySerialNumber(laptopDTO.getSerialNumber())) {
            throw new BadRequestException("Laptop with this serial number already exists");
        }

        Laptop laptop = new Laptop();
        laptop.setSerialNumber(laptopDTO.getSerialNumber());
        laptop.setBrand(laptopDTO.getBrand());
        laptop.setModel(laptopDTO.getModel());
        laptop.setSpecifications(laptopDTO.getSpecifications());
        laptop.setGpuSpecification(laptopDTO.getGpuSpecification());
        laptop.setStatus(LaptopStatus.AVAILABLE);

        return laptopRepository.save(laptop);
    }

    /**
     * Get all laptops
     */
    public List<Laptop> getAllLaptops() {
        return laptopRepository.findAll();
    }

    /**
     * Get available laptops
     */
    public List<Laptop> getAvailableLaptops() {
        return laptopRepository.findByStatus(LaptopStatus.AVAILABLE);
    }

    /**
     * Get laptop by ID
     */
    public Laptop getLaptopById(Long id) {
        return laptopRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Laptop not found"));
    }

    /**
     * Update laptop
     */
    @Transactional
    public Laptop updateLaptop(Long id, LaptopDTO laptopDTO) {
        Laptop laptop = getLaptopById(id);

        // Check if serial number is being changed and if it already exists
        if (!laptop.getSerialNumber().equals(laptopDTO.getSerialNumber()) &&
                laptopRepository.existsBySerialNumber(laptopDTO.getSerialNumber())) {
            throw new BadRequestException("Laptop with this serial number already exists");
        }

        laptop.setSerialNumber(laptopDTO.getSerialNumber());
        laptop.setBrand(laptopDTO.getBrand());
        laptop.setModel(laptopDTO.getModel());
        laptop.setSpecifications(laptopDTO.getSpecifications());
        laptop.setGpuSpecification(laptopDTO.getGpuSpecification());

        return laptopRepository.save(laptop);
    }

    /**
     * Delete laptop (only if not issued)
     */
    @Transactional
    public void deleteLaptop(Long id) {
        Laptop laptop = getLaptopById(id);

        if (laptop.getStatus() == LaptopStatus.ISSUED) {
            throw new BadRequestException("Cannot delete laptop that is currently issued");
        }

        laptopRepository.delete(laptop);
    }
}
