# Pocket Pokemon

Pocket Pokemon is a mobile app that allows users to engage in virtual Pokemon battles using React Native.

## Getting Started

To get started with Pocket Pokemon, follow these steps:

### Prerequisites

- Node.js
- npm (or yarn)
- CocoaPods (for iOS development)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/jasonduongg/pocketPokemon
    ```

2. Navigate to the project directory:

    ```bash
    cd pocketPokemon
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

    ```bash
    bundle install
    ```

4. Install CocoaPods (for iOS development):

    ```bash
    cd ios
    pod install
    ```

### Running the App

1. Start the development server:

    ```bash
    npm start
    ```

2. xcrun simctl list devices: pick two different devices on this list (developed for IPhone)

    ```bash
    open ios/AwesomeProject.xcworkspace
    ```

3. Open new terminal
    ```bash
    cd pocketPoke
    npm run ios --simulator="iPhone {#}”
    ```

4. Hover the simulator, on top left click on File => New device, pick one that is not running
    ```bash
    npm run ios --simulator="iPhone {#}”
    ```

### Usage

- Follow the on-screen instructions to engage in Pokemon battles.
- Use the provided buttons to attack, switch Pokemon, or use special moves.

### Contributing

Contributions to Pocket Pokemon are welcome! Please fork the repository, make your changes, and submit a pull request.

### License

This project is licensed under the [MIT License](LICENSE).
