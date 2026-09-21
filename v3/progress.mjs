import {questionsFor,questionError} from './questions.mjs?v=strategy-2';
export function completionProgress(state){
 const answers=state.answers||{},questions=questionsFor(answers);
 const answered=questions.filter(q=>!questionError(q,answers)).length;
 const finished=state.step===7&&new Set(state.done||[]).size===7;
 const percent=finished?100:Math.min(99,Math.round(answered/questions.length*100));
 const label=percent===100?'Your plan is ready':percent===0?'Ready when you are':percent<25?'Getting started':percent<50?'Taking shape':percent===50?'Halfway there':percent<75?'Over halfway':'Almost ready';
 return {percent,label,answered,total:questions.length,finished};
}
