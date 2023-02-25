#!/bin/bash
PSQL="psql -X --username=freecodecamp --dbname=salon --tuples-only -c"
SERVICES=$($PSQL "SELECT * FROM services ORDER BY service_id")

echo -e "\n""~~~~~ MY SALON ~~~~~""\n"

MAIN_MENU() {
 # Main Menu Heading 
  if [[ $1 ]]
  then
    echo -e "\n$1\n"
  else
    echo -e "\n""Welcome to My Salon, how can I help you?""\n"
  fi  
  
  # List Services from Database
  echo "$SERVICES" | while read SERVICE_ID BAR SERVICE_NAME;
  do
    echo "$SERVICE_ID) $SERVICE_NAME"
  done  

  # Get Service ID from Customer
  read SERVICE_ID_SELECTED
  SERVICE_ID_SELECTED=$($PSQL "SELECT service_id FROM services WHERE service_id='$SERVICE_ID_SELECTED'")

  if [[ -z $SERVICE_ID_SELECTED ]]
  then
    MAIN_MENU "I could not find that service. What would you like today?"
  else
    # Prompt customer to enter Phone
    echo "What's your phone number?"
    read CUSTOMER_PHONE

    # Get customer id, if not exist, add customer into dtabase and get id again
    CUSTOMER_ID=$($PSQL "SELECT customer_id FROM customers WHERE phone='$CUSTOMER_PHONE'")

    if [[ -z $CUSTOMER_ID ]]
    then
      # Prompt customer to enter name if they aren't already in database
      echo -e "\nI don't have a record for that phone number, what's your name?"
      read CUSTOMER_NAME
      INSERT_CUSTOMER_RESULT=$($PSQL "INSERT INTO customers(phone, name) VALUES('$CUSTOMER_PHONE', '$CUSTOMER_NAME')")
      CUSTOMER_ID=$($PSQL "SELECT customer_id FROM customers WHERE phone='$CUSTOMER_PHONE'")  
    fi
    
    # Get customer and service name
    SERVICE_NAME=$($PSQL "SELECT name FROM services WHERE service_id='$SERVICE_ID_SELECTED'")
    CUSTOMER_NAME=$($PSQL "SELECT name FROM customers WHERE customer_id='$CUSTOMER_ID'")

    # Prompt customer to enter Time
    echo -e "\nWhat time would you like your$SERVICE_NAME,$CUSTOMER_NAME?"
    read SERVICE_TIME

    # Add Appointment
    INSERT_APPOINTMENT_RESULT=$($PSQL "INSERT INTO appointments(time, customer_id, service_id) VALUES('$SERVICE_TIME', '$CUSTOMER_ID', '$SERVICE_ID_SELECTED')")
    echo -e "\n""I have put you down for a$SERVICE_NAME at $SERVICE_TIME,$CUSTOMER_NAME."
  fi
}

MAIN_MENU