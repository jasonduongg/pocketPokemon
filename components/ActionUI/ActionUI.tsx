import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Button, Image, SafeAreaView, Animated, Easing, ImageBackground } from 'react-native';
import { ref, onValue, off, limitToFirst, update } from 'firebase/database';
import { db } from '../config';

const PokemonActions = ({ gameState, playerNumber, code, lobbyName }) => {
  const [diceRollResult, setDiceRollResult] = useState(0);
  const [diceAnimation, setDiceAnimation] = useState([0,0,0,0,0]) 
  const [gameConsole, setGameConsole] = useState("Test")


  const rollDice = () => {
    const randomRoll = [
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
    ];
  
    // Animate the dice roll
    const animationInterval = setInterval(() => {
      const animatedRoll = [
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
      ];
      setDiceAnimation(animatedRoll);
    }, 250); // Change every 250 milliseconds (4 times per second)
  
    // Stop the animation after 1 second and set the result
    setTimeout(() => {
      clearInterval(animationInterval);
      setDiceAnimation(randomRoll); // Set the final animation state
      setDiceRollResult(randomRoll[2]);
    }, 1000); // Stop after 1 second (1000 milliseconds)
    return (randomRoll[2])
  };
  

  




  const [currentState, setCurrentState] = useState({});
  const [myPlayerNumber, setMyPlayerNumber] = useState("");
  const [currentPlayerTurn, setPlayersTurn] = useState("");

  const [currentTeam, setTeam] = useState({});

  const [currentPokemon, setPokemon] = useState("");
  const [currentAttacks, setAttacks] = useState({});
  const [currentBlock, setBlocks] = useState(0);
  const [currentBoost, setBoost] = useState(0);
  const [currentBoostMultiplier, setBoostMultiplier] = useState(1)

  const [blockStance, setBlockStance] = useState(false)
  const [currentHealth, setHealth] = useState(0);
  const [currentMaxHealth, setMaxHealth] = useState(0);

  const [OPTeam, setOPTeam] = useState({});

  const [OPPokemon, setOPPokemon] = useState("");
  const [OPHealth, setOPHealth] = useState(0);
  const [OPMaxHealth, setOPMaxHealth] = useState(0);
  const [OPBlockStance, setOPBlockStance] = useState(false)
  
  


  const [showAttacks, setShowAttacks] = useState(false)
  const [showRoster, setShowRoster] = useState(false)


  const [requireSwitch, setRequireSwitch] = useState(false)

  const [full, setFull] = useState(false)
  const OPNumber = playerNumber === 'player1' ? 'player2' : 'player1';



  useEffect(() => {
    setCurrentState(gameState);
    setMyPlayerNumber(playerNumber);
    setPlayersTurn(gameState.whosTurn);
    setGameConsole(gameState.gameConsole);


    if (gameState && gameState[playerNumber]) {90
      const playerData = gameState[playerNumber];
      setTeam(playerData.pokemonData);
      setPokemon(gameState[`${playerNumber}_active`]);
      const activePokemon = playerData.pokemonData[gameState[`${playerNumber}_active`]];
      setBoost(activePokemon.boost);
      setBoostMultiplier(activePokemon.boostMultiplier)
      setBlocks(activePokemon.blocks)
      setBlockStance(activePokemon.currentBlocked)
      setAttacks(activePokemon.attacks);
      setMaxHealth(activePokemon.maxHealth);
      setHealth(activePokemon.health);
      if (gameState.player2_name !== ""){
        const playerData2 = gameState[OPNumber];
        setOPTeam(playerData2.pokemonData);
        setOPPokemon(gameState[`${OPNumber}_active`]);
        setOPBlockStance(playerData2.pokemonData[gameState[`${OPNumber}_active`]].currentBlocked)
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
      setTimeout(() => {
      setRequireSwitch(true)
      }, 1000)
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
    if (OPBlockStance == true) {
      setDiceAnimation([0,0,0,0,0])
      const calculatedDamage = (currentAttacks[attack].damage * 0.2 * currentBoostMultiplier).toFixed(1);
      setTimeout(() => {
        const gameRef = ref(db, `lobbies/${lobbyName}`);
        const updates = {};
        updates['gameConsole'] = `${OPPokemon} blocks ${currentPokemon}'s ${attack} (${currentAttacks[attack].damage}) * 0.2 * ${currentBoostMultiplier} only taking ${calculatedDamage}`
        return update(gameRef, updates)
          .then(() => {
            console.log('console updated successfully!');
          })
          .catch(error => {
            console.error('Failed to update console', error);
          });
      }, 100); 
      setTimeout(() => {
        const gameRef = ref(db, `lobbies/${lobbyName}/${OPNumber}/pokemonData/${OPPokemon}`);
        const updates = {};
        updates['health'] = OPHealth - calculatedDamage;
        updates['currentBlocked'] = false;
        return update(gameRef, updates)
          .then(() => {
            console.log('Health updated successfully!');
            handleTurnChange();
          })
          .catch(error => {
            console.error('Failed to update Health:', error);
          });
        }, 100);  
      setTimeout(() => {
        const gameRef = ref(db, `lobbies/${lobbyName}/${playerNumber}/pokemonData/${currentPokemon}`);
        const updates = {};
        updates['boostMultiplier'] = 1
        return update(gameRef, updates)
          .then(() => {
            console.log('Boost updated successfully!');
          })
          .catch(error => {
            console.error('Failed to update Boost:', error);
          });
        }, 100);    
      return;
    }
  
    const latestDiceRollResult = rollDice();
  
    let damageMultiplier = 1;
    if (latestDiceRollResult === 5) {
      damageMultiplier = 2;
    } else if (latestDiceRollResult === 4 || latestDiceRollResult === 6) {
      damageMultiplier = 0;
    } else if (latestDiceRollResult === 3 || latestDiceRollResult === 7) {
      damageMultiplier = 0.75;
    } else if (latestDiceRollResult === 2 || latestDiceRollResult === 8) {
      damageMultiplier = 0.5;
    } else if (latestDiceRollResult === 1 || latestDiceRollResult === 10) {
      damageMultiplier = 0;
    }
  
    // Calculate the damage using the latest dice roll result
    const calculatedDamage = currentAttacks[attack].damage * damageMultiplier * currentBoostMultiplier;
  
    // Set the game console message including the latest dice roll result
    setTimeout(() => {
      const gameRef = ref(db, `lobbies/${lobbyName}`);
      const updates = {};
      updates['gameConsole'] = `${currentPokemon} attacks ${OPPokemon} with ${attack} (${currentAttacks[attack].damage}). A dice roll of ${latestDiceRollResult} gives a multipler of ${damageMultiplier} with a boost of ${currentBoostMultiplier} for a total of ${calculatedDamage} `
      return update(gameRef, updates)
        .then(() => {
          setBoostMultiplier(1)
          console.log('console updated successfully!');
        })
        .catch(error => {
          console.error('Failed to update console', error);
        });
    }, 1200); 

    setTimeout(() => {
      const gameRef = ref(db, `lobbies/${lobbyName}/${OPNumber}/pokemonData/${OPPokemon}`);
      const updates = {};
      updates['health'] = OPHealth - calculatedDamage;
      return update(gameRef, updates)
        .then(() => {
          console.log('Health updated successfully!');
          handleTurnChange();
        })
        .catch(error => {
          console.error('Failed to update Health:', error);
        });
      }, 1200); 
    setTimeout(() => {
      const gameRef = ref(db, `lobbies/${lobbyName}/${playerNumber}/pokemonData/${currentPokemon}`);
      const updates = {};
      updates['boostMultiplier'] = 1
      return update(gameRef, updates)
        .then(() => {
          console.log('Boost updated successfully!');
        })
        .catch(error => {
          console.error('Failed to update Boost:', error);
        });
      }, 1200);   
  };
  

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

  const handleBoost = () => {
    setTimeout(() => {
      if (currentBoost <= 0 || currentBoostMultiplier != 1) {
        console.log("ran")
        return
      }
      const gameRef = ref(db, `lobbies/${lobbyName}/${playerNumber}/pokemonData/${currentPokemon}`);
      const updates = {};
      updates['boost'] = currentBoost - 1;
      const boostMultiplier = (Math.random() * (2 - 0.7) + 0.7).toFixed(1);
      updates['boostMultiplier'] = boostMultiplier
      return update(gameRef, updates)
        .then(() => {
          console.log('Boost updated successfully!');
        })
        .catch(error => {
          console.error('Failed to update Boost:', error);
        });
      }, 100); 
  };

  const handleBlock = () => {
    setTimeout(() => {
      if (currentBlock <= 0 || blockStance == true) {
        return
      }
      const gameRef = ref(db, `lobbies/${lobbyName}/${playerNumber}/pokemonData/${currentPokemon}`);
      const updates = {};
      updates['blocks'] = currentBlock - 1;
      updates['currentBlocked'] = true;
      return update(gameRef, updates)
        .then(() => {
          console.log('Block updated successfully!');
        })
        .catch(error => {
          console.error('Failed to update Block:', error);
        });
      }, 100); 
  };

  const handleSwitchForced = (pokemon) => {
    const gameRef = ref(db, `lobbies/${lobbyName}`);
    const updates = {};
    updates[`${playerNumber}_active`] = pokemon;
  
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
      pvp_background: require('../img/pvp-background.gif'),
    };

    const BlockView = ({number, index}) => {
      return (
        <View className={`border-black border-2 ${index === 2 ? 'bg-green-300' : ''}`}>
          <Text> {number} </Text>
        </View>
      );      
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

  

       

  
        {requireSwitch ? (
          <>
          <View className = "flex flex-column justify-center items-center">
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
          </View>
          </>
        ) : (
          <View>
            <View className=" flex relative w-[100vw] h-52 bg-gray-200 items-center justify-center">
              <View className="flex relative w-[100%] h-[100%]">
              <Image className = "flex w-[100%] h-[100%]" source={images.pvp_background}/>
                <View className="absolute top-4 right-4 flex flex-column justify-center items-center ">
                  <Text className = "text-lg text-white font-bold">{OPPokemon.charAt(0).toUpperCase() + OPPokemon.slice(1)}</Text>
                  <HealthBar currentHealth={OPHealth} maxHealth={OPMaxHealth} color="red" />
                  <Image source={images[OPPokemon]} style={{ width: 100, height: 100 }} />
                </View>

                <View className="absolute bottom-4 left-4 flex flex-column justify-center items-center ">
                <Text className = "text-lg text-white font-bold">{currentPokemon.charAt(0).toUpperCase() + currentPokemon.slice(1)}</Text>
                  <HealthBar currentHealth={currentHealth} maxHealth={currentMaxHealth} color="green" />
                  <Image source={images[currentPokemon]} style={{ width: 100, height: 100 }} />
                </View>
              </View>
            </View>

    

            <View className = "flex flex-row justify-center mt-4 mb-4">
              <View className = "flex flex-row justify-center items-center">
                <Text className = "mr-4"> Boost Multipler: {currentBoostMultiplier}</Text>
                <Text className = "mr-4"> Blocking: {String(blockStance)}</Text>
                {diceAnimation.map((key, index) => (
                  <BlockView number={key} index = {index} />
                ))}
              </View>
            </View>

            <View className = "flex flex-row justify-center mb-1">
              <View className ="border-black border-2 w-[80%]">
                  <Text className = "p-4">{gameConsole}</Text>
              </View>
            </View>
            

            {full ? (
             <View className="flex flex-col justify-center mt-2">
              <View className="flex flex-row justify-center">
                <View className="flex flex-row w-[80%] justify-between">
                  <View className="border-2 border-black bg-white text-white rounded w-1/2 mr-1 mb-1">
                    <Button
                      onPress={toggleAttacks}
                      title="Attack"
                      color="#841584"
                      disabled={currentPlayerTurn !== playerNumber}
                    />
                  </View>
                  <View className="border-2 border-black bg-white text-white rounded w-1/2 ml-1 mb-1">
                    <Button
                      onPress={toggleRoster}
                      title="Party"
                      color="#841584"
                      disabled={currentPlayerTurn !== playerNumber}
                    />  
                  </View>
                </View>
              </View>
              <View className="flex flex-row justify-center">
                <View className="flex flex-row w-[80%] justify-between">
                  <View className="border-2 border-black bg-white text-white rounded w-1/2 mr-1 mb-1">
                    <Button
                      onPress={handleBoost}
                      title={`Boost (${currentBoost})`}
                      color="#841584"
                      disabled={currentPlayerTurn !== playerNumber}
                    />
                  </View>
                  <View className="border-2 border-black bg-white text-white rounded w-1/2 ml-1 mb-1">
                    <Button
                      onPress={handleBlock}
                      title={`Block (${currentBlock})`}
                      color="#841584"
                      disabled={currentPlayerTurn !== playerNumber}
                    />
                  </View>
                </View>
              </View>
            </View>
           
            ) : (
              <Text>Waiting for player 2</Text>
            )}

  
            {showAttacks && (
              <View className="flex flex-col justify-center items-center mt-5">
                {Object.keys(currentAttacks).map((key, index) => (
                  index % 2 === 0 && ( // Create a new row after every 2 attacks
                    <View className="flex flex-row w-[100%] justify-center" key={index}>
                      {Object.keys(currentAttacks).slice(index, index + 2).map((attackKey, attackIndex) => (
                        <View className = "border-2 border-black w-[40%] rounded-3xl m-1">
                          <Button title={attackKey} onPress={() => handleAttack(attackKey)} key={attackIndex} />
                        </View>
                      ))}
                    </View>
                  )
                ))}
              </View>
            )}

            {showRoster && (
            <SafeAreaView>
              <ScrollView className = "ml-4 mr-4" horizontal={true} style={{ flexDirection: 'row' }}>
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
