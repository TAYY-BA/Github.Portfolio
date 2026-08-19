const messagesEl = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('model');
const readoutLevel = document.getElementById('readout-level');
const clearBtn = document.getElementById('clearBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

let history = [];

/* ---------------- BACKEND HEALTH CHECK ---------------- */
async function checkBackend(){
  try{
    const res = await fetch('/api/health');
    const data = await res.json();
    if(data.keyConfigured){
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Backend connected';
    } else {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Backend running, no API key set';
    }
  } catch(err){
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Backend unreachable';
  }
}
checkBackend();

/* ---------------- MESSAGE RENDERING ---------------- */
function addMessage(role, text){
  const el = document.createElement('div');
  el.className = 'msg ' + role;

  const match = text.match(/TRIAGE LEVEL:\s*(LOW|MODERATE|HIGH)/i);
  if(match && role === 'bot'){
    const level = match[1].toUpperCase();
    let body = text.replace(/TRIAGE LEVEL:\s*(LOW|MODERATE|HIGH)/i, '').trim();
    
    // Injecting english precautions layout inside the chat bubble
    let precautionsHTML = "";
    if (level === "HIGH") {
        precautionsHTML = `
          <div class="precautions-box" style="margin-top: 12px; border-top: 1px solid rgba(251,69,112,0.3); padding-top: 8px;">
            <strong style="color: #fb4570;">Immediate Precautions:</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 0.95em;">
              <li>Go to the nearest emergency room immediately.</li>
              <li>Do not leave the patient alone under any circumstances.</li>
              <li>Keep the patient sitting upright if they have trouble breathing.</li>
              <li>Do not administer heavy medication or food without consulting a doctor.</li>
            </ul>
          </div>`;
    } else if (level === "MODERATE") {
        precautionsHTML = `
          <div class="precautions-box" style="margin-top: 12px; border-top: 1px solid rgba(217,70,239,0.3); padding-top: 8px;">
            <strong style="color: #d946ef;">Recommended Precautions:</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 0.95em;">
              <li>Consult a doctor or book an appointment within the next 24 hours.</li>
              <li>Ensure the patient gets proper, uninterrupted bed rest.</li>
              <li>Monitor vital signs and symptoms closely (e.g., temperature, blood pressure).</li>
              <li>If symptoms begin to worsen rapidly, proceed to the emergency room.</li>
            </ul>
          </div>`;
    } else if (level === "LOW") {
        precautionsHTML = `
          <div class="precautions-box" style="margin-top: 12px; border-top: 1px solid rgba(124,58,237,0.3); padding-top: 8px;">
            <strong style="color: #7c3aed;">Home Care Instructions:</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 0.95em;">
              <li>Rest well at home and stay hydrated by drinking plenty of water and fluids.</li>
              <li>Use basic over-the-counter medication (like Paracetamol) if needed for fever or pain.</li>
              <li>Apply symptom-specific home care (e.g., steam inhalation for cough or cold).</li>
              <li>Monitor your condition; seek professional medical advice if symptoms persist past 3 days.</li>
            </ul>
          </div>`;
    }

    const disclaimerHTML = `
      <p style="font-size: 11px; color: #888; margin: 10px 0 0 0; line-height: 1.2; font-style: italic;">
        ⚠️ Disclaimer: This chatbot is for informational triage purposes only and does not substitute professional medical advice.
      </p>`;

    el.innerHTML = escapeHtml(body) + precautionsHTML + disclaimerHTML;
    
    const verdict = document.createElement('div');
    verdict.className = 'verdict';
    const cls = level === 'LOW' ? 'low' : level === 'MODERATE' ? 'mod' : 'high';
    verdict.innerHTML = 'READING <span class="badge ' + cls + '">' + level + '</span>';
    el.appendChild(verdict);
    
    updateReadout(level);
    pulseEKG(level);
  } else {
    el.textContent = text;
  }
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function updateReadout(level){
  readoutLevel.textContent = level + ' URGENCY';
  readoutLevel.className = level === 'LOW' ? 'lvl-low' : level === 'MODERATE' ? 'lvl-mod' : 'lvl-high';
}

function showTyping(){
  const el = document.createElement('div');
  el.className = 'typing';
  el.id = 'typingIndicator';
  el.innerHTML = '<span></span><span></span><span></span>';
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function hideTyping(){
  const el = document.getElementById('typingIndicator');
  if(el) el.remove();
}

/* ---------------- SEND MESSAGE (via backend) ---------------- */
async function sendMessage(){
  const text = input.value.trim();
  if(!text) return;

  addMessage('user', text);
  history.push({role:'user', content:text});
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;
  showTyping();

  try{
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        messages: history,
        model: modelSelect.value
      })
    });

    hideTyping();

    const data = await res.json();

    if(!res.ok){
      addMessage('system', data.error || ('Request failed (' + res.status + ')'));
      sendBtn.disabled = false;
      return;
    }

    if(data.reply){
      history.push({role:'assistant', content:data.reply});
      addMessage('bot', data.reply);
    } else {
      addMessage('system', 'No response received. Please try again.');
    }
  } catch(err){
    hideTyping();
    addMessage('system', 'Could not reach the backend server. Make sure it is running (npm start in the backend folder).');
    console.error(err);
  }
  sendBtn.disabled = false;
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});
clearBtn.addEventListener('click', () => {
  history = [];
  messagesEl.innerHTML = '<div class="msg system">Conversation cleared. Describe what you\'re experiencing.</div>';
  readoutLevel.textContent = '— NO DATA —';
  readoutLevel.className = '';
});

/* ---------------- EKG CANVAS ---------------- */
const canvas = document.getElementById('ekg');
const ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;
let w, h;
function resizeCanvas(){
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let t = 0;
let currentAmp = 10;
let targetAmp = 10;
let currentColor = [139,92,246];
let targetColor = [139,92,246];
let spikeUntil = 0;

function colorFor(level){
  if(level==='LOW') return [124,58,237];
  if(level==='MODERATE') return [217,70,239];
  if(level==='HIGH') return [251,69,112];
  return [139,92,246];
}

function pulseEKG(level){
  targetColor = colorFor(level);
  targetAmp = level === 'HIGH' ? 30 : level === 'MODERATE' ? 20 : 12;
  spikeUntil = performance.now() + 2600;
}

function drawEKG(){
  ctx.clearRect(0,0,w,h);
  const midY = h/2;
  ctx.beginPath();
  ctx.lineWidth = 2;

  currentAmp += (targetAmp - currentAmp) * 0.05;
  currentColor = currentColor.map((c,i) => c + (targetColor[i]-c)*0.05);
  ctx.strokeStyle = 'rgb(' + currentColor.map(Math.round).join(',') + ')';
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 8;

  const now = performance.now();
  const spiking = now < spikeUntil;

  for(let x=0; x<=w; x+=2){
    const phase = (x + t) * 0.045;
    let y = midY;
    const cyclePos = ((x + t) % 140) / 140;
    if(cyclePos > 0.42 && cyclePos < 0.58){
      const spikeShape = Math.sin((cyclePos-0.42)/0.16 * Math.PI);
      y = midY - spikeShape * currentAmp * (spiking ? 1.8 : 1);
    } else {
      y = midY + Math.sin(phase*0.3) * 1.5;
    }
    if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  if(!spiking && targetAmp !== 10){
    targetAmp += (10 - targetAmp) * 0.01;
  }

  t += 2.2;
  requestAnimationFrame(drawEKG);
}
drawEKG();