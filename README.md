
# Gorbagana GameHub - Token-Gated Gaming Platform

A decentralized gaming platform built for the Gorbagana testnet, featuring token-gated access and reward-based gameplay mechanics.

## 🎮 Game Overview

Gorbagana GameHub is a comprehensive gaming platform that combines classic arcade games with blockchain tokenomics. Players use GORB tokens to access games and earn rewards based on their performance.

### Available Games

1. **Snake Classic** 🐍
   - Classic mobile snake gameplay with continuous movement
   - Entry Fee: 45 GORB tokens
   - Max Reward: 100 GORB tokens
   - Challenge: Avoid hitting walls or yourself while growing

2. **Fruit Luck** 🍎
   - 3-column slot machine with fruit matching
   - Entry Fee: 45 GORB tokens
   - Max Reward: 150 GORB tokens
   - Objective: Match 3 identical fruits in a row

3. **Crossword Challenge** 📝
   - Interactive crossword puzzle with hints
   - Entry Fee: 45 GORB tokens
   - Max Reward: 120 GORB tokens
   - Challenge: Complete the crossword using provided clues

## 🔗 Gorbagana Integration

### Current Implementation
- **Token System**: Local GORB token management with daily faucet
- **Daily Faucet**: Players can claim 100 GORB tokens every 24 hours
- **Game Entry**: Each game requires 45 GORB tokens to play
- **Reward System**: Token rewards based on game performance
- **Wallet Integration**: Backpack wallet connection simulation

### Planned Gorbagana Testnet Integration
- **Native Token Transactions**: Direct interaction with Gorbagana testnet
- **Real Wallet Integration**: Full Backpack wallet connectivity
- **On-chain Rewards**: Blockchain-verified token distribution
- **Multiplayer Functionality**: Real-time multiplayer game rooms
- **Tournament System**: Competitive gameplay with leaderboards

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API + TanStack Query
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Backend**: Ready for Supabase integration

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES6+ support

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd gorbagana-gamehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Backpack Wallet" on the landing page
2. **Claim Tokens**: Use the daily faucet to get 100 GORB tokens (24-hour cooldown)
3. **Choose Game**: Select from Snake Classic, Fruit Luck, or Crossword Challenge
4. **Pay Entry Fee**: Each game costs 45 GORB tokens to play
5. **Play & Earn**: Complete games to earn token rewards based on performance

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── games/           # Game implementations
│   ├── ui/              # Reusable UI components
│   └── wallet/          # Wallet and token management
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── pages/               # Route components
```

### Key Features
- **Token Context**: Centralized token state management
- **Game Hub**: Main game selection interface
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live token balance and timer updates
- **Modular Architecture**: Easy to extend with new games

## 🔮 Roadmap

### Phase 1: Backend Integration ✅
- [x] Supabase integration setup
- [ ] Real-time database configuration
- [ ] User authentication system
- [ ] Token transaction logging

### Phase 2: Blockchain Integration 🚧
- [ ] Gorbagana testnet connection
- [ ] Native GORB token integration
- [ ] Backpack wallet full integration
- [ ] On-chain transaction verification

### Phase 3: Multiplayer Features 🔄
- [ ] Real-time multiplayer Snake
- [ ] Tournament bracketing system
- [ ] Global leaderboards
- [ ] Player matchmaking

### Phase 4: Advanced Features 🎯
- [ ] NFT rewards system
- [ ] Staking mechanisms
- [ ] Social features and profiles
- [ ] Mobile app development

## 🛠️ Development Notes

### Adding New Games
1. Create game component in `src/components/games/`
2. Add game configuration to `GameHub.tsx`
3. Implement token spending/earning logic
4. Add game-specific UI components

### Token Management
- Tokens stored in localStorage (development)
- Daily claim cooldown managed via timestamps
- Game entry fees automatically deducted
- Rewards added based on game completion

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-game`)
3. Commit changes (`git commit -m 'Add amazing new game'`)
4. Push to branch (`git push origin feature/amazing-game`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐦 Social Media

Follow development progress and updates:
- Tweet using hashtag #GorbaganaTestnet
- Tag @Gorbagana_chain, @sarv_shaktimaan, and @lex_node

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Join the Gorbagana community Discord
- Follow project updates on Twitter

---

**Built with ❤️ for the Gorbagana ecosystem**
