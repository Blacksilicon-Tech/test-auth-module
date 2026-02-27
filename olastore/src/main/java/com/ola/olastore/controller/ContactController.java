package com.ola.olastore.controller;


import com.ola.olastore.constant.ApplicationConstant;
import com.ola.olastore.dto.ContactRequestDto;
import com.ola.olastore.dto.ContactResponseDto;
import com.ola.olastore.service.IContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/contacts")
public class ContactController {

    private final IContactService icontactService;

    @PostMapping("/save")
    public ResponseEntity<String> saveContact(@RequestBody ContactRequestDto contactRequestDto) {
        icontactService.saveContact(contactRequestDto);
        return ResponseEntity.ok("your message as been sent successfully");
    }

        @GetMapping("/all")
        public ResponseEntity<List<ContactResponseDto>> getAllContacts() {
        List <ContactResponseDto> contacts = icontactService.getAllContacts();

        return ResponseEntity.ok(contacts);
        }


        @PatchMapping("/{contactId}")
        public ResponseEntity<String> updateMessageStatus(@PathVariable Long contactId) {
        icontactService.updatateMessageStatus(contactId, ApplicationConstant.CLOSE_MESSAGE);
        return ResponseEntity.ok("Message ststus updated sucessfully");
        }

}
