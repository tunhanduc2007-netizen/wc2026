import { generatePrediction } from './predictor';

console.log('--- Testing AI Prediction Engine ---');

const brazil = {
  id: 'brazil-id',
  name: 'Brazil',
  code: 'BRA',
  eloRating: 2120,
  fifaRanking: 5,
  attackRating: 88,
  defenseRating: 85,
  midfieldRating: 87,
  squadValueEur: 980.5,
};

const morocco = {
  id: 'morocco-id',
  name: 'Morocco',
  code: 'MAR',
  eloRating: 1840,
  fifaRanking: 13,
  attackRating: 77,
  defenseRating: 81,
  midfieldRating: 79,
  squadValueEur: 320.0,
};

// Case 1: All players fit
console.log('\nCase 1: Full squad fitness (Brazil vs Morocco)');
const res1 = generatePrediction(brazil, morocco, [], []);
console.log('Result probabilities:');
console.log(`- Brazil Win: ${res1.homeWinProb}%`);
console.log(`- Draw: ${res1.drawProb}%`);
console.log(`- Morocco Win: ${res1.awayWinProb}%`);
console.log(`Expected goals: Brazil ${res1.expectedHomeGoals} - Morocco ${res1.expectedAwayGoals}`);
console.log(`Most likely score: ${res1.predictedHomeScore}-${res1.predictedAwayScore}`);
console.log(`Secondary score: ${res1.secondaryHomeScore}-${res1.secondaryAwayScore}`);
console.log('Top score probabilities:', res1.scoreProbabilities);
console.log('Betting suggestions:', JSON.stringify(res1.bettingTips, null, 2));
console.log(`Confidence: ${res1.confidenceScore}% (${res1.riskLevel} Risk)`);

// Case 2: Brazil has severe squad injuries
console.log('\nCase 2: Brazil has core forward injuries (e.g. Vinicius Jr, Rodrygo out)');
const injuredBrazilPlayers = [
  { position: 'FWD', status: 'INJURED', marketValueEur: 150 }, // Vinicius Jr
  { position: 'FWD', status: 'INJURED', marketValueEur: 110 }, // Rodrygo
  { position: 'MID', status: 'FIT', marketValueEur: 50 },
  { position: 'DEF', status: 'FIT', marketValueEur: 40 },
];
const res2 = generatePrediction(brazil, morocco, injuredBrazilPlayers, []);
console.log('Result probabilities with injuries:');
console.log(`- Brazil Win: ${res2.homeWinProb}%`);
console.log(`- Draw: ${res2.drawProb}%`);
console.log(`- Morocco Win: ${res2.awayWinProb}%`);
console.log(`Expected goals: Brazil ${res2.expectedHomeGoals} - Morocco ${res2.expectedAwayGoals}`);
console.log(`Most likely score: ${res2.predictedHomeScore}-${res2.predictedAwayScore}`);
console.log(`Confidence: ${res2.confidenceScore}% (${res2.riskLevel} Risk)`);
console.log('--- Testing Complete ---');
