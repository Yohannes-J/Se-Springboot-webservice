package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.enities.Customer;
import org.wldu.webservices.services.contracts.CustomerService;

import java.util.List;

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
