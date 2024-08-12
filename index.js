const axios = require('axios');
const ics = require('ics');
const fs = require('fs');

async function getUpcomingContests() {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    return response.data.result.filter(contest => contest.phase === 'BEFORE');
  } catch (error) {
    console.error('Error fetching contests:', error);
    return [];
  }
}

function createICSEvents(contests) {
  return contests.map(contest => ({
    title: contest.name,
    start: new Date(contest.startTimeSeconds * 1000).toISOString().split('T')[0].split('-').map(Number),
    duration: { hours: Math.floor(contest.durationSeconds / 3600), minutes: (contest.durationSeconds % 3600) / 60 },
    description: `Codeforces contest: ${contest.name}`,
    url: `https://codeforces.com/contest/${contest.id}`
  }));
}

async function saveICSFile(events) {
  const { error, value } = ics.createEvents(events);
  
  if (error) {
    console.error('Error creating ICS events:', error);
    return;
  }

  fs.writeFileSync('codeforces_contests.ics', value);
  console.log('ICS file saved successfully.');
}

async function main() {
  const contests = await getUpcomingContests();
  const icsEvents = createICSEvents(contests);
  await saveICSFile(icsEvents);
}

main();