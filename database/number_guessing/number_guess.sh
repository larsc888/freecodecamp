#!/bin/bash
PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"

MAIN_MENU () {
  PROCESS_USER  
  START_GAME
}

PROCESS_USER () {
  # Show default guess prompt
  if [[ $1 ]]
  then
    echo -e "\n$1"
  else
    echo -e "\nEnter your username:"
  fi   
  
  read USERNAME

  if [[ -z $USERNAME ]]
  then
    PROCESS_USER "Enter your username:"  
  fi
  
  USER_ID=$($PSQL "SELECT user_id FROM users WHERE username='$USERNAME'")
  if [[ $USER_ID ]]
  then
    GAME_COUNT=$($PSQL "SELECT COUNT(*) FROM games WHERE user_id=$USER_ID")
    MIN_GUESS=$($PSQL "SELECT MIN(guess) FROM games WHERE user_id=$USER_ID")
    echo -e "\nWelcome back, $USERNAME! You have played $GAME_COUNT games, and your best game took $MIN_GUESS guesses."
  else
    INSERT_USER=$($PSQL "INSERT INTO users(username) VALUES('$USERNAME')") 
    USER_ID=$($PSQL "SELECT user_id FROM users WHERE username='$USERNAME'") 
    echo -e "\nWelcome, $USERNAME! It looks like this is your first time here."    
  fi
}

START_GAME () {
  RANDOM_NUMBER=$(( $RANDOM % 1000 + 1 ))
  GUESS_COUNT=0
  GUESS
}

GUESS () {
  # Show default guess prompt
  if [[ $1 ]]
  then
    echo -e "\n$1"
  else
    echo -e "\nGuess the secret number between 1 and 1000:"
  fi 
  
  read USER_GUESS

  # Validate user input
  if [[ ! $USER_GUESS =~ ^[0-9]+$ ]]
  then
    GUESS "That is not an integer, guess again:"
  fi  
  
  # Add a guess as long as integer is selected
  GUESS_COUNT=$(( $GUESS_COUNT + 1 ))

  # Deal with game logic
  if [[ $USER_GUESS -eq $RANDOM_NUMBER ]]
  then
    INSERT_GAME=$($PSQL "INSERT INTO games(guess, user_id) VALUES('$GUESS_COUNT', $USER_ID)")
    echo -e "\nYou guessed it in $GUESS_COUNT tries. The secret number was $RANDOM_NUMBER. Nice job!"  
  elif [[ $USER_GUESS -gt $RANDOM_NUMBER ]]
  then 
    GUESS "It's lower than that, guess again:"
  else [[ $USER_GUESS -lt $RANDOM_NUMBER ]]
    GUESS "It's higher than that, guess again:"
  fi
}

MAIN_MENU