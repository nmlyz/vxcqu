const formArea = document.getElementById('formArea');
const preview = document.getElementById('templatePreview');
const sendButton = document.getElementById('sendButton');
const copyButton = document.getElementById('copyButton');

const templates = {
  nyanzu: {
    title: '【 にゃんず量産🐈‍⬛ 】',
    fields: [
      '早期', '左右', '性別', '髪型', '髪色', '目色',
      '服色', '小物', '猫耳（あり or なし）'
    ],
    footer: '※猫色固定'
  },
  ganbare: {
    title: '【 がんばれ！量産 】',
    fields: [
      '早期', '左右', '性別', '髪型', '髪色', '目色',
      '体操服色', 'ゼッケンの文字' , '小物'
    ],
    footer: '※体操服とハチマキの色は同色になります'
  },
  nikoichi: {
  title: '【 にこいち！量産 】',
  fields: [
      '早期', '左右', '性別', '髪型', '髪色', '目色',
      '服色', '小物'
    ],
  footer: ' '
  }
};

let currentType = 'nyanzu';

function createEarlyField() {
  const container = document.createElement('div');
  container.className = 'field-group';
  
  const label = document.createElement('label');
  label.textContent = '早期';
  container.appendChild(label);
  
  const radioContainer = document.createElement('div');
  radioContainer.className = 'radio-group';
  
  const yesLabel = document.createElement('label');
  yesLabel.innerHTML = `<input type="radio" name="early_toggle" value="あり" checked> あり`;
  const noLabel = document.createElement('label');
  noLabel.innerHTML = `<input type="radio" name="early_toggle" value="なし"> なし`;
  
  radioContainer.appendChild(yesLabel);
  radioContainer.appendChild(noLabel);
  container.appendChild(radioContainer);
  
  const select = document.createElement('select');
  select.name = '早期';
  ['24h', '3日', '7日'].forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  container.appendChild(select);
  
  select.disabled = false;
  
  // --- ここから追加・修正 ---
  function updateLabelSelection() {
    radioContainer.querySelectorAll('label').forEach(lbl => {
      const input = lbl.querySelector('input[type="radio"]');
      if (input.checked) {
        lbl.classList.add('selected');
      } else {
        lbl.classList.remove('selected');
      }
    });
  }
  updateLabelSelection();
  
  radioContainer.querySelectorAll('input[name="early_toggle"]').forEach(radio => {
    radio.addEventListener('change', () => {
      select.disabled = radio.value !== 'あり';
      updateLabelSelection();
      updatePreview();
    });
  });
  // --- ここまで追加・修正 ---
  
  return container;
}

function createNekoMimiField() {
  const container = document.createElement('div');
  container.className = 'field-group';
  
  const label = document.createElement('label');
  label.textContent = '猫耳';
  container.appendChild(label);
  
  const radioContainer = document.createElement('div');
  radioContainer.className = 'radio-group';
  
  const yesLabel = document.createElement('label');
  yesLabel.innerHTML = `<input type="radio" name="猫耳" value="あり" checked> あり`;
  const noLabel = document.createElement('label');
  noLabel.innerHTML = `<input type="radio" name="猫耳" value="なし"> なし`;
  
  radioContainer.appendChild(yesLabel);
  radioContainer.appendChild(noLabel);
  container.appendChild(radioContainer);
  
  radioContainer.querySelectorAll('input[name="猫耳"]').forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });
  
  return container;
}

function renderForm() {
  const template = templates[currentType];
  formArea.innerHTML = '';
  
  template.fields.forEach(field => {
    if (field === '早期') {
      formArea.appendChild(createEarlyField());
      return;
    }
    if (field.includes('猫耳')) {
      formArea.appendChild(createNekoMimiField());
      return;
    }
    
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';
    
    const label = document.createElement('label');
    label.textContent = field;
    fieldGroup.appendChild(label);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.name = field;
    input.placeholder = `${field}を入力`;
    fieldGroup.appendChild(input);
    
    formArea.appendChild(fieldGroup);
  });
  
  updatePreview();
}

function updatePreview() {
  const template = templates[currentType];
  let result = `${template.title}\n`;
  
  // 早期の値取得
  const earlyToggle = formArea.querySelector('input[name="early_toggle"]:checked');
  if (earlyToggle) {
    const earlyValue = earlyToggle.value === 'あり' ?
      formArea.querySelector('select[name="早期"]').value :
      'なし';
    result += `早期 ╎ ${earlyValue}\n`;
  }
  
  // 猫耳の値取得
  const nekoMimiRadio = formArea.querySelector('input[name="猫耳"]:checked');
  if (nekoMimiRadio) {
    result += `猫耳 ╎ ${nekoMimiRadio.value}\n`;
  }
  
  // その他テキスト入力値
  const inputs = formArea.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    result += `${input.name} ╎ ${input.value}\n`;
  });
  
  result += `\n${template.footer}`;
  preview.value = result;
}

document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentType = e.target.value;
    renderForm();
    document.querySelectorAll('.select-btn').forEach(label => {
      label.classList.toggle('selected', label.querySelector('input').checked);
    });
  });
});

formArea.addEventListener('input', updatePreview);
formArea.addEventListener('change', updatePreview);

sendButton.addEventListener('click', () => {
  const message = encodeURIComponent(preview.value);
  const url = `https://twitter.com/messages/compose?recipient_id=1892974018548080640&text=${message}`;
  window.open(url, '_blank');
});

copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(preview.value);
  copyButton.textContent = 'コピーしました！';
  setTimeout(() => (copyButton.textContent = 'テンプレをコピー'), 1500);
});

// 初期処理
document.querySelectorAll('.select-btn').forEach(label => {
  label.classList.toggle('selected', label.querySelector('input').checked);
});
renderForm();