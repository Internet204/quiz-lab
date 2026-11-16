import {questions} from './questions.mjs';
import {isAnswered,gradeQuestion,summarize} from './logic.mjs';
const $=id=>document.getElementById(id), key='local-quiz-lab-v1';
const fresh=()=>({answers:{},flags:{},current:1,all:false,deadline:Date.now()+1800000,finished:false,blockPaste:false,preview:false});
let state=fresh();
try { const saved=JSON.parse(localStorage.getItem(key)); if(saved?.answers&&saved?.flags) state={...state,...saved}; } catch {}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(key,JSON.stringify(state));$('save-status').textContent='All changes saved on this device.';}catch{$('save-status').textContent='Storage unavailable; keep this page open.';}}
function options(q,value){return '<option value="">Choose…</option>'+q.options.map(([id,text])=>`<option value="${id}" ${value===id?'selected':''}>${esc(text)}</option>`).join('');}
function controls(q){const a=state.answers[q.id], disabled=state.finished?'disabled':'';
 if(['single','multiple'].includes(q.type)) return `<div class="options" role="group" aria-label="Answer choices">${q.options.map(([id,text])=>`<label class="option"><input data-answer="${q.id}" type="${q.type==='single'?'radio':'checkbox'}" name="q${q.id}" value="${id}" ${(q.type==='single'?a===id:Array.isArray(a)&&a.includes(id))?'checked':''} ${disabled}><span class="option-letter">${id}.</span><span class="option-text">${esc(text)}</span></label>`).join('')}</div>`;
 if(q.type==='matching') return `<div class="matching">${q.rows.map(([id,text])=>`<label class="match-row"><span>${esc(text)}</span><select class="answer-select" data-answer="${q.id}" data-row="${id}" ${disabled}>${options(q,a?.[id])}</select></label>`).join('')}</div>`;
 if(q.type==='select') return `<label class="text-answer-row">Answer: <select class="answer-select" data-answer="${q.id}" ${disabled}>${options(q,a)}</select></label>`;
 return `<label class="text-answer-row">Answer: <input class="answer-input" type="text" ${q.type==='number'?'inputmode="decimal"':''} autocomplete="off" spellcheck="false" maxlength="300" data-answer="${q.id}" value="${esc(a)}" ${state.finished?'readonly':''}></label>`;
}
function status(q){return state.finished?(gradeQuestion(q,state.answers[q.id])?'Correct':'Incorrect'):(isAnswered(q,state.answers[q.id])?'Answer saved':'Not yet answered');}
function nav(){ $('question-navigation').innerHTML=questions.map(q=>`<button class="qnav ${state.current===q.id?'current':''} ${isAnswered(q,state.answers[q.id])?'answered':''} ${state.flags[q.id]?'flagged':''} ${state.finished?(gradeQuestion(q,state.answers[q.id])?'correct':'incorrect'):''}" data-go="${q.id}" aria-label="Question ${q.id}: ${status(q)}" ${state.current===q.id?'aria-current="step"':''}>${q.id}<span class="nav-icon">${state.finished?(gradeQuestion(q,state.answers[q.id])?'✓':'×'):''}</span></button>`).join(''); }
function render(){nav(); const visible=state.all?questions:[questions[state.current-1]];
 $('questions').innerHTML=visible.map(q=>`<article class="question-row" id="question-${q.id}"><aside class="question-meta"><p class="question-number">Question <strong>${q.id}</strong></p><p class="answer-status" id="status-${q.id}">${status(q)}</p><p class="mark-info">${state.finished?`Mark ${gradeQuestion(q,state.answers[q.id])?'1.00':'0.00'} out of`:'Marked out of'} 1.00</p><label class="flag-label"><input type="checkbox" data-flag="${q.id}" ${state.flags[q.id]?'checked':''}><span><span class="flag-symbol">⚑</span>Flag question</span></label></aside><section class="question-panel" aria-label="Question ${q.id}"><h2 class="question-prompt">${esc(q.prompt)}</h2>${q.type==='multiple'?'<p class="question-hint">Select one or more:</p>':''}${controls(q)}</section></article>`).join('');
 $('page-label').textContent=state.all?'All 20 questions':`Question ${state.current} of 20`;
 $('view-mode').textContent=state.all?'Show one page at a time':'Show all questions';
 $('previous').disabled=state.current===1; $('next').textContent=state.current===20?'Finish attempt …':'Next page';
 $('previous').hidden=state.all; $('next').hidden=state.all||state.finished&&state.current===20;
 $('jump-question').innerHTML=questions.map(q=>`<option value="${q.id}" ${q.id===state.current?'selected':''}>Question ${q.id}</option>`).join('');
 $('finish-side').textContent=state.finished?'Start a new attempt':'Finish attempt …';
 $('block-paste').checked=state.blockPaste; $('show-preview').checked=state.preview; $('preview').hidden=!state.preview;
 $('result-summary').hidden=!state.finished;
 if(state.finished){const r=summarize(questions,state.answers);$('result-summary').innerHTML=`<table class="summary-table"><tbody><tr><th>Status</th><td>Finished</td></tr><tr><th>Answered</th><td>${r.answered} / ${r.total}</td></tr><tr><th>Marks</th><td>${r.correct}.00 / ${r.total}.00</td></tr><tr><th>Grade</th><td><strong>${r.percent}.00</strong> out of 100.00</td></tr></tbody></table>`;}
}
function go(id){state.current=Math.max(1,Math.min(20,Number(id)));save();render();$(`question-${state.current}`).scrollIntoView({block:'start'});}
function finish(){if(state.finished){$('reset-dialog').showModal();return;}const r=summarize(questions,state.answers);$('finish-message').textContent=`You have answered ${r.answered} of ${r.total} questions. ${r.total-r.answered} remain unanswered.`;$('finish-dialog').showModal();}
document.addEventListener('click',e=>{const target=e.target.closest('[data-go]');if(target)go(target.dataset.go);});
$('questions').addEventListener('input',e=>{const t=e.target;if(t.dataset.flag){state.flags[t.dataset.flag]=t.checked;save();nav();return;}if(!t.dataset.answer||state.finished)return;const id=Number(t.dataset.answer),q=questions[id-1];
 if(q.type==='multiple')state.answers[id]=[...document.querySelectorAll(`[data-answer="${id}"]:checked`)].map(x=>x.value);
 else if(q.type==='matching')state.answers[id]={...state.answers[id],[t.dataset.row]:t.value};else state.answers[id]=t.value;
 save();nav();$(`status-${id}`).textContent=status(q);
});
$('questions').addEventListener('paste',e=>{if(state.blockPaste&&e.target.matches('.answer-input')){e.preventDefault();$('save-status').textContent='Paste blocked for this test. Keyboard input is enabled.';}});
$('view-mode').onclick=()=>{state.all=!state.all;save();render();};
$('previous').onclick=()=>go(state.current-1);$('next').onclick=()=>state.current===20?finish():go(state.current+1);
$('first-question').onclick=()=>go(1);$('last-question').onclick=()=>go(20);$('jump-question').onchange=e=>go(e.target.value);
$('finish-side').onclick=finish;$('new-attempt').onclick=()=>$('reset-dialog').showModal();
$('finish-dialog').addEventListener('close',()=>{if($('finish-dialog').returnValue==='finish'){state.finished=true;state.completedAt=Date.now();save();render();$('result-summary').scrollIntoView({block:'start'});}});
$('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue==='reset'){state=fresh();save();render();window.scrollTo(0,0);}});
$('block-paste').onchange=e=>{state.blockPaste=e.target.checked;save();};$('show-preview').onchange=e=>{state.preview=e.target.checked;$('preview').hidden=!state.preview;save();};
$('hide-timer').onclick=()=>{state.timerHidden=!state.timerHidden;save();tick();};
function tick(){const seconds=Math.max(0,Math.ceil((state.deadline-(state.completedAt||Date.now()))/1000));$('timer-value').textContent=`${Math.floor(seconds/3600)}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;$('timer').hidden=!!state.timerHidden;$('hide-timer').textContent=state.timerHidden?'Show':'Hide';}
render();tick();setInterval(tick,1000);
