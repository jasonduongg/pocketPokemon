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
        thunderbolt: { damage: 90, element: 'electric' },
        quickAttack: { damage: 40, element: 'normal' },
        // Add two more attacks to make a total of four attacks
        lightingBall: { damage: 50, element: 'normal' },
        bait: { damage: 60, element: 'electric' }
      },
      blocks: 2,
      boost: 1,
      boostMultiplier: 1,
      currentBlocked: false,
      health: 100,
      maxHealth: 100,
    },
    charizard: {
      attacks: {
        flamethrower: { damage: 90, element: 'fire' },
        dragonClaw: { damage: 80, element: 'dragon' },
        // Add two more attacks to make a total of four attacks
        chomp: { damage: 70, element: 'fire' },
        punch: { damage: 85, element: 'dragon' }
      },
      blocks: 2,
      boost: 1,
      boostMultiplier: 1,
      currentBlocked: false,
      health: 150,
      maxHealth: 150,
    },
    bulbasaur: {
      attacks: {
        vineWhip: { damage: 45, element: 'grass' },
        razorLeaf: { damage: 55, element: 'grass' },
        // Add two more attacks to make a total of four attacks
        charge: { damage: 60, element: 'grass' },
        acidRain: { damage: 70, element: 'grass' }
      },
      blocks: 2,
      boost: 1,
      boostMultipier: 1,
      currentBlocked: false,
      health: 120,
      maxHealth: 120,
    }
  };

  const pokemonData2 = {
    squirtle: {
      attacks: {
        waterGun: { damage: 40, element: 'water' },
        shellAttack: { damage: 50, element: 'normal' },
        // Add two more attacks to make a total of four attacks
        whirlPool: { damage: 45, element: 'water' },
        loudSnore: { damage: 55, element: 'normal' }
      },
      blocks: 2,
      boost: 1,
      boostMultiplier: 1,
      currentBlocked: false,
      health: 110,
      maxHealth: 110
    },
    eevee: {
      attacks: {
        tackle: { damage: 35, element: 'normal' },
        quickAttack: { damage: 40, element: 'normal' },
        // Add two more attacks to make a total of four attacks
        dash: { damage: 30, element: 'normal' },
        heavenlySword: { damage: 45, element: 'normal' }
      },
      blocks: 2,
      boost: 1,
      boostMultiplier: 1,
      currentBlocked: false,
      health: 95,
      maxHealth: 95
    },
    jolteon: {
      attacks: {
        thunderShock: { damage: 65, element: 'electric' },
        pinMissile: { damage: 25, element: 'bug' },
        // Add two more attacks to make a total of four attacks
        flash: { damage: 30, element: 'electric' },
        pewpew: { damage: 40, element: 'electric' }
      },
      blocks: 2,
      boost: 1,
      boostMultiplier: 1,
      currentBlocked: false,
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

    const code = generateRandomCode();
    const lobbyRef = push(ref(db, 'lobbies'));
    const lobbyData = {
      code: code,
      player1_name: "1", //PLACEHOLDER
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
            player2_name: "2", //PLACE HOLDER
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
    <View className="bg-gray-200 flex items-center justify-center h-screen">
      <SafeAreaView className="flex flex-col items-center justify-center w-[80vw] bg-green-500">
  
        <View className="border-2 border-black bg-red-200 text-white p-2 rounded w-full">
          <Button
          onPress={createLobby}
          title="Create New Lobby"
          />
        </View>
        <View className="border-2 border-black bg-red-200 text-white p-2 rounded w-full flex flex-column justify-center items-center">
          <TextInput
            className="bg-gray-400 h-10 w-1/2 mt-4 px-2"
            value={lobbyCode}
            onChangeText={(text) => setLobbyCode(text)}
            placeholder="Enter Lobby Code"
          />
          <Button className = "text-white" onPress={() => joinLobby(lobbyCode)} title="Join Lobby" />
         </View>
        </SafeAreaView>
    </View>

  );

  const renderActionUI = () => (
    <SafeAreaView>
     <Button onPress={() => leaveLobby()} title = "leave lobby"></Button>
     <ActionUI lobbyName = {lobbyName} code = {lobbyCode} gameState={currentLobby} playerNumber={playerNumber}/>
    </SafeAreaView>
  );

  return (
    <View>
      {Object.keys(currentLobby).length === 0 ? renderLandingUI() : renderActionUI()}
    </View>
  );

};

export default App;
