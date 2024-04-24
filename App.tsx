import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, View, Text } from 'react-native';
import { getDatabase, ref, set, push, child, get, onValue, off } from 'firebase/database';
import { db } from './components/config.jsx';
import { update } from 'firebase/database';

import ActionUI  from "./components/ActionUI/ActionUI.tsx"

const App = () => {
  const [name, setName] = useState('');
  const [lobbyName, setLobbyName] = useState("");
  const [lobbyCode, setLobbyCode] = useState('');
  const [currentLobby, setLobby] = useState({});
  const [playerNumber, setPlayerNumber] = useState('');

  const pokemonData = {
    pikachu: {
      attacks: {
        thunderbolt: {
          damage: 90,
          element: 'electric'
        },
        quickAttack: {
          damage: 40,
          element: 'normal'
        }
      },
      health: 100,
      maxHealth: 100,
    },
    charizard: {
      attacks: {
        flamethrower: {
          damage: 90,
          element: 'fire'
        },
        dragonClaw: {
          damage: 80,
          element: 'dragon'
        }
      },
      health: 150,
      maxHealth: 150,
    },
    bulbasaur: {
      attacks: {
        vineWhip: {
          damage: 45,
          element: 'grass'
        },
        razorLeaf: {
          damage: 55,
          element: 'grass'
        }
      },
      health: 120,
      maxHealth: 120,
    }
  };

  const pokemonData2 = {
    squirtle: {
      attacks: {
        waterGun: {
          damage: 40,
          element: 'water'
        },
        shellAttack: {
          damage: 50,
          element: 'normal'
        }
      },
      health: 110,
      maxHealth: 110
    },
    eevee: {
      attacks: {
        tackle: {
          damage: 35,
          element: 'normal'
        },
        quickAttack: {
          damage: 40,
          element: 'normal'
        }
      },
      health: 95,
      maxHealth: 95
    },
    jolteon: {
      attacks: {
        thunderShock: {
          damage: 65,
          element: 'electric'
        },
        pinMissile: {
          damage: 25,
          element: 'bug'
        }
      },
      health: 90,
      maxHealth: 90
    }
  };
  
  
  useEffect(() => {
    if (lobbyName) {
      const lobbyRef = ref(db, `lobbies/${lobbyName}`);
      const onValueChange = onValue(lobbyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLobby(data);
        }
      }, (error) => {
        alert(`Failed to listen to lobby data: ${error.message}`);
      });

      return () => off(lobbyRef, 'value', onValueChange);
    }
  }, [lobbyName]);

  function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  }

  function createLobby() {
    if (name === '') {
      alert('Please enter a name');
      return;
    }
    const code = generateRandomCode();
    const lobbyRef = push(ref(db, 'lobbies'));
    const lobbyData = {
      code: code,
      player1_name: name,
      player1: {pokemonData},
      player1_active: Object.keys(pokemonData)[0],
      player2_name: "",
      whosTurn: 'player1'
    };

    set(lobbyRef, lobbyData)
      .then(() => {
        alert(`Lobby created with code: ${code}`);
        setPlayerNumber("player1")
        setLobbyCode(code);
        setLobbyName(lobbyRef.key);
        setLobby(lobbyData);
      })
      .catch((error) => {
        alert(`Error creating lobby: ${error.message}`);
      });
  }

  async function joinLobby(lobbyCode) {
    if (lobbyCode === '') {
      alert('Please enter a lobby code');
      return;
    }
    if (name === '') {
      alert('Please enter a name');
      return;
    }

    const lobbyCodesRef = ref(db, 'lobbies');
    const lobbyCodesSnapshot = await get(lobbyCodesRef);
    let targetLobbyKey = null;

    if (lobbyCodesSnapshot.exists()) {
      const lobbyCodes = lobbyCodesSnapshot.val();
      Object.entries(lobbyCodes).forEach(([key, value]) => {
        if (value.code === lobbyCode) {
          targetLobbyKey = key;
          return;
        }
      });
    }

    if (targetLobbyKey) {
      const targetLobbyRef = ref(db, `lobbies/${targetLobbyKey}`);
      get(targetLobbyRef).then((snapshot) => {
        const lobbyData = snapshot.val();
        if (lobbyData && lobbyData.player2) {
          throw new Error('Player two already exists in this lobby');
        } else {
          let pokemonData = pokemonData2
          update(targetLobbyRef, {
            player2_name: name,
            player2: {pokemonData},
            player2_active: Object.keys(pokemonData2)[0]
          }).then(() => {
            alert(`You joined lobby ${lobbyCode} as player2`);
          }).catch((error) => {
            alert(`Error joining lobby: ${error.message}`);
          });
        }
        setPlayerNumber("player2")
        setLobbyCode(lobbyCode);
        setLobbyName(targetLobbyKey);
        setLobby(lobbyData);
      }).catch((error) => {
        alert(`Error joining lobby: ${error.message}`);
      });
    } else {
      return;
    }
  }

  function leaveLobby() {
    setLobby({})
    setLobbyCode("")
    setLobbyName("")
  }

  const renderLandingUI = () => (
    <>
      <TextInput
        style={{ backgroundColor: 'gray', width: 200, height: 40 }}
        value={name}
        onChangeText={(text) => setName(text)}
        placeholder="Name"
      />
      <TextInput
        style={{ backgroundColor: 'gray', width: 200, height: 40, marginTop: 20 }}
        value={lobbyCode}
        onChangeText={(text) => setLobbyCode(text)}
        placeholder="Enter Lobby Code"
      />
      <Button onPress={() => joinLobby(lobbyCode)} title="Join Lobby" />
      {Object.keys(currentLobby).length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text>Lobby Code: {currentLobby.code}</Text>
          <Text>Player 1: {currentLobby.player1_name}</Text>
          <Text>Player 2: {currentLobby.player2_name || 'None'}</Text>
          <Text>Whose Turn: {currentLobby.whosTurn}</Text>
        </View>
      )}
      <Button onPress={createLobby} title="Create Lobby" />
    </>
  );

  const renderActionUI = () => (
    <>
     <Button onPress={() => leaveLobby()} title = "leave lobby"></Button>
     <ActionUI lobbyName = {lobbyName} code = {lobbyCode} gameState={currentLobby} playerNumber={playerNumber}/>
    </>
  );

  return (
    <SafeAreaView>
      {Object.keys(currentLobby).length === 0 ? renderLandingUI() : renderActionUI()}
    </SafeAreaView>
  );

};

export default App;
