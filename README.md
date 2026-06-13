# FIFA World Cup AI Prediction & Analytics Platform

This is a premium, high-fidelity sports analytics platform built using Next.js 15, React 19, TypeScript, Express, Prisma ORM, and Recharts. The system analyzes ELO rating differences, team attacking/defensive qualities, squad market values, and injured/suspended star player variables to simulate matches and bracket outcomes.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: SQLite (default for instant setup), compatible with PostgreSQL.
- **AI/Math Engine**: Elo rating differentials + Poisson Goal expectation models + Monte Carlo knockout bracket simulators.

---

## 📐 Mathematical Models & Architecture

### 1. Goal Expectation (xG) Model ($\lambda$)
Expected goals scored by Home Team $i$ against Away Team $j$:
$$\lambda_{home} = \text{AvgGoals} \times \text{Att}_i \times \text{Def}_j \times \text{EloAdjust}_{i, j} \times \text{SquadAdjust}_i$$
$$\lambda_{away} = \text{AvgGoals} \times \text{Att}_j \times \text{Def}_i \times \text{EloAdjust}_{j, i} \times \text{SquadAdjust}_j$$

Where:
- $\text{AvgGoals}$ is set to $1.35$ goals/team/match.
- $\text{Att}$ and $\text{Def}$ are normalize-scaled indexes.
- $\text{EloAdjust}$ scales expectations by $10\%$ per 100 Elo rating points difference.
- $\text{SquadAdjust}$ represents availability ratios: injured/suspended forwards/midfielders reduce attacking power, whereas missing defenders/goalkeepers increase the opponent's goal expectancy.

### 2. Exact Score Probabilities (Poisson Distribution)
The probability of Team A scoring $x$ goals and Team B scoring $y$ goals is calculated using independent Poisson events:
$$P(X=x, Y=y) = \frac{e^{-\lambda_{home}} \lambda_{home}^x}{x!} \times \frac{e^{-\lambda_{away}} \lambda_{away}^y}{y!}$$

Summing cells of the $8 \times 8$ matrix yields outcomes for:
- **Home Win**: $\sum_{x > y} P(x, y)$
- **Draw**: $\sum_{x = y} P(x, y)$
- **Away Win**: $\sum_{x < y} P(x, y)$
- **Over/Under 2.5 Goals**: $\sum_{x+y > 2.5} P(x, y)$
- **Both Teams to Score (BTTS)**: $(1 - P(X=0)) \times (1 - P(Y=0))$

### 3. Tournament Monte Carlo Knockout Simulator
POST `/api/bracket/simulate` runs a 1,000-iteration tournament simulation. It seeds qualified teams from Groups A-H and rolls randomized outcomes at each stage (Round of 16, Quarterfinals, Semifinals, Finals) based on Elo probability metrics to calculate progression odds.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- npm v10+

### Setup & Installation

1. **Install all dependencies (root, server, and client)**
   Run this in the root directory:
   ```bash
   npm run install:all
   ```

2. **Initialize Database Schema & Seeds**
   Run this in the root directory:
   ```bash
   npm run db:init
   ```

3. **Start Both Frontend and Backend Servers**
   Run this in the root directory to spin up the Express API (port 3001) and Next.js client (port 3000):
   ```bash
   npm start
   ```

4. **Verify Prediction Math**
   You can also test the math engine by running:
   ```bash
   npm run test:predictor --prefix server
   ```

---

## 🗄️ Database Adaptation: Switching to PostgreSQL

If you wish to deploy with PostgreSQL in production:
1. Open `server/prisma/schema.prisma`.
2. Replace the `datasource db` provider block:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Create a `.env` file in the `server/` directory and configure the environment variable:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/worldcup_db?schema=public"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```
