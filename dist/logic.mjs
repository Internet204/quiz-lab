export function normalized(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g,' ');
}
export function isAnswered(question, answer) {
  if (question.type === 'multiple') return Array.isArray(answer) && answer.length > 0;
  if (question.type === 'matching') return !!answer && question.rows.every(([id]) => Boolean(answer[id]));
  return normalized(answer).length > 0;
}
export function gradeQuestion(question, answer) {
  if (!isAnswered(question, answer)) return false;
  if (question.type === 'multiple') {
    const selected = [...new Set(answer)].sort();
    const expected = [...question.correct].sort();
    return selected.length === expected.length && selected.every((v,i) => v === expected[i]);
  }
  if (question.type === 'matching') return question.rows.every(([id]) => answer[id] === question.correct[id]);
  if (question.type === 'number') {
    const value = String(answer).trim().replace(',', '.');
    return /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(value) && Number(value) === question.correct;
  }
  if (question.type === 'text') return question.correct.some(value => normalized(value) === normalized(answer));
  return answer === question.correct;
}
export function summarize(questions, answers) {
  const answered = questions.filter(q=>isAnswered(q, answers[q.id])).length;
  const correct = questions.filter(q=>gradeQuestion(q, answers[q.id])).length;
  return {answered, correct, total:questions.length, percent:Math.round(correct/questions.length*100)};
}
