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

// プログレスバーの表示/非表示と早期オプションを切り替える関数
function toggleProgressBar() {
  const selectedItem = document.getElementById('item').value;
  const progressContainer = document.querySelector('.progress-container');
  const speedSelect = document.getElementById('speed');
  const noneOption = speedSelect.querySelector('option[value="なし"]');
  const peopleNumSlider = document.getElementById('people_num');
  const peopleValue = document.getElementById('peopleValue');
  
  if (selectedItem === 'ちび簡易依頼') {
    progressContainer.style.display = 'block';
    // 「なし」オプションを完全に削除して、24hを選択
    if (noneOption) {
      noneOption.remove();
    }
    speedSelect.value = '24h';
  } else if (selectedItem === 'ほっぺつん量産') {
    progressContainer.style.display = 'none';
    // people_numを1に設定
    peopleNumSlider.value = 1;
    peopleValue.textContent = '1';
    // 「なし」オプションを追加（まだない場合）
    if (!speedSelect.querySelector('option[value="なし"]')) {
      const newNoneOption = document.createElement('option');
      newNoneOption.value = 'なし';
      newNoneOption.textContent = 'なし';
      speedSelect.insertBefore(newNoneOption, speedSelect.firstChild);
    }
    speedSelect.value = 'なし';
  } else {
    // その他の項目は「なし」オプションを追加（まだない場合）
    progressContainer.style.display = 'block';
    if (!speedSelect.querySelector('option[value="なし"]')) {
      const newNoneOption = document.createElement('option');
      newNoneOption.value = 'なし';
      newNoneOption.textContent = 'なし';
      speedSelect.insertBefore(newNoneOption, speedSelect.firstChild);
    }
    speedSelect.value = 'なし';
  }
}

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

    // セレクトボックスにイベントリスナーを追加
document.getElementById('item').addEventListener('change', toggleProgressBar);

    // 初期表示の設定
    toggleProgressBar();

    itemsLoaded = true;
    checkReady();
  });

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

// 日付をM/D形式に整形（年は表示しない）
function formatDate(dateObj) {
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  return `${m}/${d}`;
}

// 日付に指定日数を足してM/D形式で返す
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return formatDate(result);
}

// 1ヶ月半後の日付をM/D形式で返す
function addMonthAndHalf(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() + 15);
  return formatDate(d);
}

function generateMessage() {
  const item = document.getElementById('item').value;
  const speed = document.getElementById('speed').value;
  const people_num = document.getElementById('people_num').value;
  const dateStr = document.getElementById('orderDate').value;

  if (!dateStr) {
    alert('依頼日を入力してください');
    return;
  }

  const basePrice = items[item] * people_num;
  const earlyType = earlyTypeMap[item];
  const speedPrice = earlyPrices[earlyType][speed];
  const total = basePrice + speedPrice;

  let paymentMessage = '';
  const orderDate = new Date(dateStr);
  let confirmMessage = '';
  let deadline = '';

  if (speed === 'なし') {
    // 早期料金表示なし
    paymentMessage = `お支払い¥${total}になります🌟\nお手際の際3日以内にリンクお願いします(⋆ᴗ͈ˬᴗ͈⋆)`;
    deadline = addMonthAndHalf(orderDate);
    confirmMessage = `📍〜1ヶ月半(${deadline}まで)\n返信、反応不要`;
  } else {
    // 早期料金あり
    paymentMessage = `¥${basePrice}+早期¥${speedPrice}でお支払い\n¥${total}になります🌟\nお手際の際3日以内にリンクお願いします(⋆ᴗ͈ˬᴗ͈⋆)`;


    if (speed === '24h') {
      // 翌日23:59まで → 日付は翌日、時刻は文字列で追加
      const nextDay = new Date(orderDate);
      nextDay.setDate(nextDay.getDate() + 1);
      deadline = formatDate(nextDay) + ' 23:59まで';
      confirmMessage = `📍〜24h (${deadline})\n返信、反応不要`;
    } else if (speed === '3日') {
      deadline = addDays(orderDate, 3) + 'まで';
      confirmMessage = `📍〜3日 (${deadline})\n返信、反応不要`;
    } else if (speed === '7日') {
      deadline = addDays(orderDate, 7) + 'まで';
      confirmMessage = `📍〜7日 (${deadline})\n返信、反応不要`;
    }
  }

document.getElementById('outputPayment').textContent = paymentMessage;
document.getElementById('outputConfirm').textContent = confirmMessage;
}

function copyText(id) {
  const text = document.getElementById(id).textContent;
navigator.clipboard.writeText(text).then(() => alert('コピーしました！'));
}