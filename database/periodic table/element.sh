#!/bin/bash

PSQL="psql -X --username=freecodecamp --dbname=periodic_table --tuples-only -c"


if [[ -z $1 ]]
then
  echo "Please provide an element as an argument."
else
  if [[ $1 =~ [1-9] ]]
  then
    SEARCH_RESULT=$($PSQL "SELECT * FROM elements 
                           INNER JOIN properties ON elements.atomic_number=properties.atomic_number
                           INNER JOIN types ON properties.type_id=types.type_id
                           WHERE elements.atomic_number=$1");
  elif [[ $1 =~ ^[A-Z]{1}[a-z]?$ ]]
  then
    SEARCH_RESULT=$($PSQL "SELECT * FROM elements 
                           INNER JOIN properties ON elements.atomic_number=properties.atomic_number
                           INNER JOIN types ON properties.type_id=types.type_id
                           WHERE elements.symbol='$1'");
  else
    SEARCH_RESULT=$($PSQL "SELECT * FROM elements 
                           INNER JOIN properties ON elements.atomic_number=properties.atomic_number\
                           INNER JOIN types ON properties.type_id=types.type_id
                           WHERE elements.name='$1'");

  fi

  # Print result if search result found
  if [[ $SEARCH_RESULT ]]
  
  then
    echo "$SEARCH_RESULT" | while read ATOMIC_NUM BAR SYMBOL BAR NAME BAR ATOMIC_NUM2 BAR ATOMIC_MASS BAR MELTING_POINT BAR BOILING_POINT BAR TYPE_ID VAR TYPE_ID BAR TYPE
    do
      echo "The element with atomic number $ATOMIC_NUM is $NAME ($SYMBOL). \
It's a $TYPE, with a mass of $ATOMIC_MASS amu. $NAME has a \
melting point of $MELTING_POINT celsius and a boiling point of $BOILING_POINT celsius."
    done

  else
    echo "I could not find that element in the database."
  fi
  
fi