package com.ola.olastore.service;

import com.ola.olastore.dto.ContactRequestDto;
import com.ola.olastore.dto.ContactResponseDto;
import com.ola.olastore.entity.Contact;

import java.util.List;

public interface IContactService {

    String saveContact(ContactRequestDto contactRequestDto) ;


    List<ContactResponseDto> getAllContacts();


    String updatateMessageStatus(Long contactId, String status);




}
