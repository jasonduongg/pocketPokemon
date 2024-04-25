import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Button, Image, SafeAreaView, Animated, Easing } from 'react-native';
import { ref, onValue, off, limitToFirst, update } from 'firebase/database';
import { db } from '../config';

const PokemonActions = ({ gameState, playerNumber, code, lobbyName }) => {
  const [diceRollResult, setDiceRollResult] = useState(0);
  const [rollingAnimation] = useState(new Animated.Value(0));
  const [diceAnimation, setDiceAnitmation] = useState([0,0,0,0,0]) 


  const rollDice = () => {
    
      const randomRoll = 
      [
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
      ];
      setDiceAnitmation(randomRoll)
      return randomRoll
   
  };




  const [currentState, setCurrentState] = useState({});
  const [myPlayerNumber, setMyPlayerNumber] = useState("");
  const [currentPlayerTurn, setPlayersTurn] = useState("");

  const [currentTeam, setTeam] = useState({});

  const [currentPokemon, setPokemon] = useState("");
  const [currentAttacks, setAttacks] = useState({});
  const [currentHealth, setHealth] = useState(0);
  const [currentMaxHealth, setMaxHealth] = useState(0);

  const [OPTeam, setOPTeam] = useState({});

  const [OPPokemon, setOPPokemon] = useState("");
  const [OPHealth, setOPHealth] = useState(0);
  const [OPMaxHealth, setOPMaxHealth] = useState(0);

  const [showAttacks, setShowAttacks] = useState(false)
  const [showRoster, setShowRoster] = useState(false)


  const [requireSwitch, setRequireSwitch] = useState(false)

  const [full, setFull] = useState(false)
  const OPNumber = playerNumber === 'player1' ? 'player2' : 'player1';



  useEffect(() => {
    setCurrentState(gameState);
    setMyPlayerNumber(playerNumber);
    setPlayersTurn(gameState.whosTurn);

    if (gameState && gameState[playerNumber]) {
      const playerData = gameState[playerNumber];
      setTeam(playerData.pokemonData);
      setPokemon(gameState[`${playerNumber}_active`]);
      const activePokemon = playerData.pokemonData[gameState[`${playerNumber}_active`]];
      setAttacks(activePokemon.attacks);
      setMaxHealth(activePokemon.maxHealth);
      setHealth(activePokemon.health);
      if (gameState.player2_name !== ""){
        const playerData2 = gameState[OPNumber];
        console.log(playerData2.pokemonData)
        setOPTeam(playerData2.pokemonData);
        setOPPokemon(gameState[`${OPNumber}_active`]);
        setOPMaxHealth(playerData2.pokemonData[gameState[`${OPNumber}_active`]].maxHealth);
        setOPHealth(playerData2.pokemonData[gameState[`${OPNumber}_active`]].health);
        setFull(true)
      }
    }
    if (full) {
      const isPlayer1Lost = Object.values(currentTeam).every(pokemon => pokemon.health <= 0);
      const isPlayer2Lost = Object.values(OPTeam).every(pokemon => pokemon.health <= 0);
      if (isPlayer1Lost || isPlayer2Lost) {
        // Logic for determining the winner
        if (isPlayer1Lost && isPlayer2Lost) {
      
          alert("It's a tie!");
        } else if (isPlayer1Lost) {
          alert("You Lost!");
        } else {
          alert("You Won!");
        }
      }
    }
    if (full && currentHealth <= 0) {
      setRequireSwitch(true)
    }
  }, [gameState, playerNumber]);

  const handleTurnChange = () => {
    const newTurn = currentPlayerTurn === `${playerNumber}` ? `${OPNumber}` : `${playerNumber}`;  
    const gameRef = ref(db, `lobbies/${lobbyName}`);
    const updates = {};
    updates['whosTurn'] = newTurn;
    return update(gameRef, updates)
      .then(() => {
        setShowAttacks(false)
        setShowRoster(false)
        console.log('Turn updated successfully!');
      })
      .catch(error => {
        console.error('Failed to update turn:', error);
      });
  };

  const toggleAttacks = () => {
    setShowAttacks(!showAttacks)
    setShowRoster(false)
  } 

  const toggleRoster = () => {
    setShowRoster(!showRoster)
    setShowAttacks(false)
  }

  const handleAttack = (attack) => {
    const diceRoll = rollDice()

    let damageMultiplier = 1;
    if (diceRoll === 5) {
      damageMultiplier = 2;
    } else if (diceRoll === 4 || diceRoll === 6) {
      damageMultiplier = 0;
    } else if (diceRoll === 4 || diceRoll === 6) {
      damageMultiplier = 1;
    } else if (diceRoll === 3 || diceRoll === 7) {
      damageMultiplier = 0.75;
    } else if (diceRoll === 2 || diceRoll == 8) {
      damageMultiplier = 0.5;
    } else if (diceRoll === 1 || diceRoll === 10) {
      damageMultiplier = 0;
    }
    const calculatedDamage = currentAttacks[attack].damage * damageMultiplier;

    console.log(playerNumber + " has attacked " + OPNumber + " using " + currentPokemon + " to " + OPPokemon + " with " + attack)
    const gameRef = ref(db, `lobbies/${lobbyName}/${OPNumber}/pokemonData/${OPPokemon}`);
    const updates = {};
    updates['health'] = OPHealth - calculatedDamage;
    return update(gameRef, updates)
      .then(() => {
        console.log('Health updated successfully!');
        handleTurnChange()
      })
      .catch(error => {
        console.error('Failed to update Health:', error);
      });
  }

  const handleSwitch = (pokemon) => {
    const gameRef = ref(db, `lobbies/${lobbyName}`);
    const updates = {};
    updates[`${playerNumber}_active`] = pokemon;
  
    // Update the active Pokemon for the current player in the lobby
    update(gameRef, updates)
      .then(() => {
        setRequireSwitch(false)
        handleTurnChange()
        console.log(`Switched ${pokemon} for player ${playerNumber}`);
      })
      .catch((error) => {
        console.error("Error switching Pokemon:", error);
      });
  };

  const handleSwitchForced = (pokemon) => {
    const gameRef = ref(db, `lobbies/${lobbyName}`);
    const updates = {};
    updates[`${playerNumber}_active`] = pokemon;
  
    // Update the active Pokemon for the current player in the lobby
    update(gameRef, updates)
      .then(() => {
        setRequireSwitch(false)
        console.log(`Switched ${pokemon} for player ${playerNumber}`);
      })
      .catch((error) => {
        console.error("Error switching Pokemon:", error);
      });
  };

  const HealthBar = ({ currentHealth, maxHealth, color }) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 100, height: 20, backgroundColor: "lightgray", borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ width: `${(currentHealth / maxHealth) * 100}%`, height: '100%', backgroundColor: color }} />
        </View>
      </View>
    );
  };
  
  
  const images = {
      charizard: require('../img/charizard.png'),
      pikachu: require('../img/pikachu.png'),
      bulbasaur: require('../img/bulbasaur.png'),
      squirtle: require('../img/squirtle.png'),
      eevee: require('../img/eevee.png'),
      jolteon: require('../img/jolteon.png'),
    };
    




  return (
      <View className = "w-full h-full">
        <SafeAreaView>
      

        <View className = "flex flex-row w-full justify-center">
          {!full && <Text className = "text-black text-xl" >Lobby Code: {code}</Text>}
          
          {full && (
            currentPlayerTurn === playerNumber ? (
              <Text className="text-red-500 text-xl">YOUR TURN!</Text>
            ) : (
              <Text className="text-red-500 text-xl">OPPONENTS TURN!</Text>
            )
          )}
        </View>

        <Text>{diceAnimation}</Text>

       

  
        {requireSwitch ? (
          <>
            <Text>Switch your Pokemon!</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {Object.keys(currentTeam).map((key, index) => (
                <View>

                <Button
                  title={key}
                  onPress={() => handleSwitchForced(key)}
                  disabled={currentTeam[key].health <= 0 || key === currentPokemon}
                  key={index}
                />
                <Image source={images[key]} style={{ width: 100, height: 100 }} />

                </View>
              ))}
            </View>
          </>
        ) : (
          <View>
            <View className=" flex relative w-[100vw] h-96 bg-gray-200 items-center justify-center">
              <View className=" flex relative w-[90%] h-[90%]">
                <View className="absolute top-0 right-0 flex flex-column justify-center items-center ">
                  <Text className = "text-lg">{OPPokemon.charAt(0).toUpperCase() + OPPokemon.slice(1)}</Text>
                  <HealthBar currentHealth={OPHealth} maxHealth={OPMaxHealth} color="red" />
                  <Image source={images[OPPokemon]} style={{ width: 100, height: 100 }} />
                </View>

                <View className="absolute bottom-0 left-0 flex flex-column justify-center items-center ">
                <Text className = "text-lg">{currentPokemon.charAt(0).toUpperCase() + currentPokemon.slice(1)}</Text>
                  <HealthBar currentHealth={currentHealth} maxHealth={currentMaxHealth} color="green" />
                  <Image source={images[currentPokemon]} style={{ width: 100, height: 100 }} />
                </View>
              </View>
            </View>

          
            {full ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View className="border-2 border-black bg-white text-white p-2 rounded w-1/2">
                <Button
                  onPress={toggleAttacks}
                  title="Attack"
                  color="#841584"
                  disabled={currentPlayerTurn !== playerNumber}
                />
                </View>

                <View className="border-2 border-black bg-white text-white p-2 rounded w-1/2">
                <Button
                  onPress={toggleRoster}
                  title="Party"
                  color="#841584"
                  disabled={currentPlayerTurn !== playerNumber}
                />
                </View>
              </View>
            ) : (
              <Text>Waiting for player 2</Text>
            )}

  
            {showAttacks && (
              <>
                {Object.keys(currentAttacks).map((key, index) => (
                  <Button title={key} onPress={() => handleAttack(key)} key={index} />
                ))}
              </>
            )}
  
            {showRoster && (
            <SafeAreaView>
              <ScrollView horizontal={true} style={{ flexDirection: 'row' }}>
                {Object.keys(currentTeam).map((key, index) => (
                  <View key={index} style={{ marginRight: 10 }}>
                    <Button
                      title={key}
                      onPress={() => handleSwitch(key)}
                      disabled={currentTeam[key].health <= 0 || key === currentPokemon}
                    />
                    <Image source={images[key]} style={{ width: 100, height: 100 }} />
                    <HealthBar
                      currentHealth={currentTeam[key].health}
                      maxHealth={currentTeam[key].maxHealth}
                      color="green"
                    />
                  </View>
                ))}
              </ScrollView>
            </SafeAreaView>
          )}

  
           



          </View>
        )}
        </SafeAreaView>
      </View>
  );  
};


export default PokemonActions;
