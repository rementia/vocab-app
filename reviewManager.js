export function makeReviewKey(item) {
  return item.id;
}

export function getReviewScore(reviewScores, item) {
  return Number(reviewScores[makeReviewKey(item)]?.score) || 0;
}

export function updateReviewScore(reviewScores, item, delta) {
  const key = makeReviewKey(item);
  const currentScore = getReviewScore(reviewScores, item);
  const nextScore = Math.max(-5, Math.min(5, currentScore + delta));

  if (nextScore === 0) {
    delete reviewScores[key];
  } else {
    reviewScores[key] = {
      score: nextScore,
      updatedAt: Date.now()
    };
  }

  return nextScore;
}


export function resetReviewScore(reviewScores, item) {
  delete reviewScores[makeReviewKey(item)];
  return 0;
}

export function getReviewWeight(score) {
  return Math.max(1, 4 + score);
}


export function sortByReviewScore(words, getScore) {
  return [...words]
    .map((item, originalIndex) => ({
      item,
      originalIndex,
      score: getScore(item),
      tieRank: Math.random()
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.tieRank !== a.tieRank) return b.tieRank - a.tieRank;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}

export function shuffleByReviewWeight(words, getScore) {
  return [...words]
    .map((item) => {
      const weight = getReviewWeight(getScore(item));
      return {
        item,
        rank: Math.pow(Math.random(), 1 / weight)
      };
    })
    .sort((a, b) => b.rank - a.rank)
    .map(({ item }) => item);
}
