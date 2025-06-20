const items = {};
const earlyTypeMap = {};
let earlyPrices = {};

let itemsLoaded = false;
let earlyLoaded = false;

function checkReady() {
  if (itemsLoaded && earlyLoaded) {
    document.getElementById('generateBtn').disabled = false;
  }
}

// items.csv 読み込み
fetch('items.csv')
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const [name, price, earlyType] = lines[i].split(',');
      items[name] = parseInt(price);
      earlyTypeMap[name] = earlyType;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = `${name}（¥${price}）`;
      document.getElementById('item').appendChild(option);
    }
    itemsLoaded = true;
    checkReady();
  });

// early.csv 読み込み
fetch('early.csv')
  .then(res => res.text())
  .then(csv => {
    const lines = csv.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const [type, h24, d3, d7] = lines[i].split(',');
      earlyPrices[type] = {
        '24h': parseInt(h24),
        '3日': parseInt(d3),
        '7日': parseInt(d7),
        'なし': 0
      };
    }
    earlyLoaded = true;
    checkReady();
  });

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

function addMonthAndHalf(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() + 15);
  return d.toISOString().split('T')[0];
}

function generateMessage() {
  const item = document.getElementById('item').value;
  const speed = document.getElementById('speed').value;
  const dateStr = document.getElementById('orderDate').value;

  if (!dateStr) {
    alert('依頼日を入力してください');
    return;
  }

  const basePrice = items[item];
  const earlyType = earlyTypeMap[item];
  const speedPrice = earlyPrices[earlyType][speed];
  const total = basePrice + speedPrice;

  const paymentMessage = `かしこまりました！\n(${basePrice})+早期(${speedPrice})でお支払い \n¥${total}になります\u2729 \nお手際の際3日以内にリンクお願いします(\u22c6\u1d17\u0361\u204e\u1d17\u22c6)`;

  const orderDate = new Date(dateStr);
  let confirmMessage = '';
  let deadline = '';

  if (speed === '24h') {
    deadline = addDays(orderDate, 1) + ' 23:59まで';
    confirmMessage = `確認できました！\n📍〜24h  (${deadline})\n返信、反応不要`;
  } else if (speed === '3日') {
    deadline = addDays(orderDate, 3);
    confirmMessage = `確認できました！\n📍〜3日  (${deadline}まで)\n返信、反応不要`;
  } else if (speed === '7日') {
    deadline = addDays(orderDate, 7);
    confirmMessage = `確認できました！\n📍〜7日  (${deadline}まで)\n返信、反応不要`;
  } else {
    deadline = addMonthAndHalf(orderDate);
    confirmMessage = `かしこまりました！\n📍〜1ヶ月半(${deadline}まで)\n返信、反応不要`;
  }

  document.getElementById('outputPayment').textContent = paymentMessage;
  document.getElementById('outputConfirm').textContent = confirmMessage;
}

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => alert('コピーしました！'));
}
