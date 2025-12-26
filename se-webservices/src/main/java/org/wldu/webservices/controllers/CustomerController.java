package org.wldu.webservices.controllers;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.entities.Customer;
import org.wldu.webservices.services.contracts.CustomerService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Add user
    @PostMapping
    public ResponseEntity<Customer> addCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.addCustomer(customer));
    }

    @GetMapping("/list")
    public Map<String, Object> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "1") int draw
    ) {

        Page<Customer> customerPage =
                customerService.getCustomers(search, page, size, sortBy, sortDir);

        Map<String, Object> response = new HashMap<>();

        response.put("draw", draw);
        response.put("data", customerPage.getContent());
        response.put("recordsTotal", customerPage.getTotalElements());
        response.put("recordsFiltered", customerPage.getTotalElements());
        response.put("currentPage", customerPage.getNumber());
        response.put("totalPages", customerPage.getTotalPages());
        response.put("pageSize", customerPage.getSize());

        return response;
    }

    // Get all users
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustmer(id));
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer updatedCustomer) {
        return ResponseEntity.ok(customerService.updateCustmer(id, updatedCustomer));
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }

    // Search by name
    @GetMapping("/search/name")
    public List<Customer> searchByName(@RequestParam String name) {
        return customerService.searchByName(name);
    }

    // Search by email
    @GetMapping("/search/email")
    public List<Customer> searchByEmail(@RequestParam String email) {
        return customerService.searchByEmail(email);
    }
}
