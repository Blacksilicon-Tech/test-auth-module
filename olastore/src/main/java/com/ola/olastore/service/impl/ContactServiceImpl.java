package com.ola.olastore.service.impl;

import com.ola.olastore.constant.ApplicationConstant;
import com.ola.olastore.dto.ContactRequestDto;
import com.ola.olastore.dto.ContactResponseDto;
import com.ola.olastore.entity.Contact;
import com.ola.olastore.repository.ContactRepository;
import com.ola.olastore.service.IContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements IContactService {

    private final ContactRepository contactRepository;


    @Override
    public String saveContact(ContactRequestDto contactRequestDto) {
        Contact contact = mapContactRequestDtoContactEntity(contactRequestDto);
        contactRepository.save(contact);
        return "your message was successfully sent";
    }

    @Override
    public List<ContactResponseDto> getAllContacts() {
        List<Contact> contacts = contactRepository.findAll();
        return contacts.stream().map(this::mapToContactResponseDto).toList();
    }

    @Override
    public String updatateMessageStatus(Long contactId,String status) {
        Contact contact = contactRepository.findById(contactId).orElseThrow(() -> new RuntimeException("Contact not Found"));
        contact.setStatus(status);
        contactRepository.save(contact);
    return "Message status updated successfully";
    }

    private ContactResponseDto mapToContactResponseDto(Contact contact){
        ContactResponseDto responseDto = new ContactResponseDto();
        responseDto.setName(contact.getName());
        responseDto.setEmails(contact.getEmail());
        responseDto.setMobileNumbers(contact.getMobileNumber());
        responseDto.setMessage(contact.getMessage());
        return responseDto;
    }

    private Contact mapContactRequestDtoContactEntity(
            ContactRequestDto  contactRequestDto){

        Contact contact = new Contact();
        contact. setName(contactRequestDto.name());
        contact.setEmail(contactRequestDto.email());
        contact.setMobileNumber(contactRequestDto.mobileNumber());
        contact.setMessage(contactRequestDto.message());
        return contact;

    }
}
