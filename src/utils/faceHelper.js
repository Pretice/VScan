let predictedAges = [];

export function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}

export const gender2Emoji = (gender) => {
  switch (gender) {
    case 'male':
      return '♂️';
    case 'female':
      return '♀️';
    default:
      return null;
  }
};

export const expression2Emoji = (exp) => {
  switch (exp) {
    case 'neutral':
      return '🙂';
    case 'happy':
      return '😀';
    case 'sad':
      return '😥';
    case 'angry':
      return '😠';
    case 'fearful':
      return '😨';
    case 'disgusted':
      return '🤢';
    case 'surprised':
      return '😳';
    default:
      return '😎';
  }
};
