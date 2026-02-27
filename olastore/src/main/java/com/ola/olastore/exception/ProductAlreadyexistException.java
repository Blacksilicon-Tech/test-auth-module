package com.ola.olastore.exception;

public class ProductAlreadyexistException extends RuntimeException {
  public ProductAlreadyexistException(String message) {
    super(message);
  }
}
