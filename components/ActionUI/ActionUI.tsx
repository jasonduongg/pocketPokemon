import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { ref, onValue, off, limitToFirst, update } from 'firebase/database';
import { db } from '../config';

const PokemonActions = ({ gameState, playerNumber, code, lobbyName }) => {
  const [currentState, setCurrentState] = useState({});
  const [myPlayerNumber, setMyPlayerNumber] = useState("");
  const [currentPlayerTurn, setPlayersTurn] = useState("");

  const [currentTeam, setTeam] = useState({});

  const [currentPokemon, setPokemon] = useState("");
  const [currentAttacks, setAttacks] = useState({});
  const [currentHealth, setHealth] = useState(0);
  const [currentMaxHealth, setMaxHealth] = useState(0);


  const [OPPokemon, setOPPokemon] = useState("");
  const [OPHealth, setOPHealth] = useState(0);
  const [OPMaxHealth, setOPMaxHealth] = useState(0);

  const [showAttacks, setShowAttacks] = useState(false)
  const [showRoster, setShowRoster] = useState(false)


  const [requireSwitch, setRequireSwitch] = useState(false)


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
        setOPPokemon(gameState[`${OPNumber}_active`]);
        setOPMaxHealth(playerData2.pokemonData[gameState[`${OPNumber}_active`]].maxHealth);
        setOPHealth(playerData2.pokemonData[gameState[`${OPNumber}_active`]].health);
      }
    }
    if (currentHealth < 0) {
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
    console.log(playerNumber + " has attacked " + OPNumber + " using " + currentPokemon + " to " + OPPokemon + " with " + attack)
    const gameRef = ref(db, `lobbies/${lobbyName}/${OPNumber}/pokemonData/${OPPokemon}`);
    const updates = {};
    updates['health'] = OPHealth - currentAttacks[attack].damage;
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

  const HealthBar = ({ currentHealth, maxHealth }) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ marginRight: 8 }}>Health:</Text>
        <View style={{ width: 100, height: 20, backgroundColor: 'lightgray', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ width: `${(currentHealth / maxHealth) * 100}%`, height: '100%', backgroundColor: 'green' }} />
        </View>
        <Text style={{ marginLeft: 8 }}>{currentHealth}/{maxHealth}</Text>
      </View>
    );
  };
  


  return (
    <ScrollView>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB' }}>
        <Text>Lobby Code: {code}</Text>
        <Text>Player Number: {myPlayerNumber}</Text>
        <Text>Current Player's Turn: {currentPlayerTurn}</Text>
  
        {currentPlayerTurn === `${playerNumber}` && (
          <Text style={{ color: 'red', fontSize: 20 }}>YOUR TURN!</Text>
        )}
  
        {requireSwitch ? (
          <>
            <Text>Switch your Pokemon!</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {Object.keys(currentTeam).map((key, index) => (
                <Button
                  title={key}
                  onPress={() => handleSwitch(key)}
                  disabled={currentTeam[key].health <= 0 || key === currentPokemon}
                  key={index}
                />
              ))}
            </View>
          </>
        ) : (
          <View>
            <Text>Current Pokemon: {currentPokemon}</Text>
            <HealthBar currentHealth={currentHealth} maxHealth={currentMaxHealth} />
  
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Button
                onPress={toggleAttacks}
                title="Attack"
                color="#841584"
                disabled={currentPlayerTurn !== `${playerNumber}`}
              />
  
              <Button
                onPress={toggleRoster}
                title="Party"
                color="#841584"
                disabled={currentPlayerTurn !== `${playerNumber}`}
              />
            </View>
  
            {showAttacks && (
              <>
                {Object.keys(currentAttacks).map((key, index) => (
                  <Button title={key} onPress={() => handleAttack(key)} key={index} />
                ))}
              </>
            )}
  
            {showRoster && (
              <View>
                <Text>Switch your Pokemon!</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {Object.keys(currentTeam).map((key, index) => (
                    <Button
                      title={key}
                      onPress={() => handleSwitch(key)}
                      disabled={currentTeam[key].health <= 0 || key === currentPokemon}
                      key={index}
                    />
                  ))}
                </View>
              </View>
            )}
  
            <Text>OP Pokemon: {OPPokemon}</Text>
            
            
            <HealthBar currentHealth={OPHealth} maxHealth={OPMaxHealth} />



          </View>
        )}
      </View>
    </ScrollView>
  );  
};


export default PokemonActions;
